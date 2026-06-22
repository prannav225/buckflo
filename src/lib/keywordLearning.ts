import { db } from "../db/database";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from",
  "by", "with", "in", "of", "is", "are", "was", "were", "it", "this", "that"
]);

/**
 * Extracts lowercase words from a string, removing punctuation and stop words.
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Remove punctuation and split by whitespace
  const words = text
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
  
  // Return unique keywords
  return Array.from(new Set(words));
}

let isBootstrapped = false;

export async function bootstrapLearningIfNeeded() {
  if (isBootstrapped) return;
  const count = await db.keywordMappings.count();
  if (count === 0) {
    const transactions = await db.transactions.toArray();
    for (const tx of transactions) {
      if (tx.category && tx.description) {
        await learnFromTransaction(tx.description, tx.category);
      }
    }
  }
  isBootstrapped = true;
}

/**
 * Suggests a category based on the description's keywords.
 * Returns the suggestion with the highest confidence.
 */
export async function suggestCategory(description: string): Promise<{
  category: string;
  confidence: number;
  totalCount: number;
  isAutoLog: boolean;
} | null> {
  await bootstrapLearningIfNeeded();

  const keywords = extractKeywords(description);
  if (keywords.length === 0) return null;

  let bestMatch: { category: string; confidence: number; totalCount: number } | null = null;

  for (const keyword of keywords) {
    // Find all mappings for this keyword
    const mappings = await db.keywordMappings
      .where("keyword")
      .equals(keyword)
      .toArray();

    for (const mapping of mappings) {
      if (!bestMatch || mapping.confidence > bestMatch.confidence) {
        bestMatch = {
          category: mapping.category,
          confidence: mapping.confidence,
          totalCount: mapping.totalCount,
        };
      } else if (mapping.confidence === bestMatch.confidence && mapping.totalCount > bestMatch.totalCount) {
        bestMatch = {
          category: mapping.category,
          confidence: mapping.confidence,
          totalCount: mapping.totalCount,
        };
      }
    }
  }

  if (!bestMatch) return null;

  // Auto-log conditions: highly confident AND seen multiple times
  const isAutoLog = bestMatch.confidence >= 0.9 && bestMatch.totalCount >= 4;

  return {
    ...bestMatch,
    isAutoLog,
  };
}

/**
 * Updates the keyword learning map based on a confirmed transaction.
 */
export async function learnFromTransaction(description: string, finalCategory: string): Promise<void> {
  if (!finalCategory) return;
  const keywords = extractKeywords(description);
  if (keywords.length === 0) return;

  const now = Date.now();

  await db.transaction("rw", db.keywordMappings, async () => {
    for (const keyword of keywords) {
      // Find the specific mapping for this keyword AND category
      const existingMappings = await db.keywordMappings
        .where("keyword")
        .equals(keyword)
        .toArray();
        
      // We need to update the correct count for the chosen category,
      // and increment the total count for ALL mappings of this keyword.
      // Wait, if a keyword maps to multiple categories, each row represents one category.
      // totalCount should be the same for all rows of the same keyword to calculate accurate probability.
      // Actually, a simpler approach: Each row is a (keyword, category) pair.
      // `correctCount` is times it was this category.
      // We don't really need `totalCount` across ALL categories in the DB, 
      // but it helps if confidence = correctCount / totalCount_of_this_keyword.
      // Let's compute totalCount across all categories for this keyword.
      
      let totalUsageForKeyword = existingMappings.reduce((sum, m) => sum + m.correctCount, 0) + 1;

      // Update all existing rows with the new totalCount and recalculated confidence
      let categoryFound = false;

      for (const mapping of existingMappings) {
        let newCorrectCount = mapping.correctCount;
        if (mapping.category === finalCategory) {
          newCorrectCount += 1;
          categoryFound = true;
        }

        await db.keywordMappings.update(mapping.id!, {
          correctCount: newCorrectCount,
          totalCount: totalUsageForKeyword,
          confidence: newCorrectCount / totalUsageForKeyword,
          lastUsed: mapping.category === finalCategory ? now : mapping.lastUsed,
        });
      }

      // If the keyword wasn't mapped to this category before, insert it
      if (!categoryFound) {
        await db.keywordMappings.add({
          keyword,
          category: finalCategory,
          correctCount: 1,
          totalCount: totalUsageForKeyword,
          confidence: 1 / totalUsageForKeyword,
          lastUsed: now,
        });
      }
    }
  });
}
