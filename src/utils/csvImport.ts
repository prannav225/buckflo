import { parse, format, isValid } from "date-fns";
import { db, adjustBalance } from "../db/database";
import type { Transaction } from "../db/database";

/**
 * Normalizes date string from various formats (e.g. DD-MM-YYYY, MM/DD/YYYY) into YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const formats = [
    "yyyy-MM-dd",
    "dd-MM-yyyy",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "yyyy/MM/dd",
    "d MMM yyyy",
    "d MMMM yyyy",
    "yyyy-MM-dd'T'HH:mm:ss.SSSX",
    "yyyy-MM-dd'T'HH:mm:ssX",
  ];

  for (const fmt of formats) {
    try {
      const parsedDate = parse(cleaned, fmt, new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, "yyyy-MM-dd");
      }
    } catch {
      // ignore parsing error and try next format
    }
  }

  const nativeDate = new Date(cleaned);
  if (isValid(nativeDate)) {
    return format(nativeDate, "yyyy-MM-dd");
  }

  // Fallback to today
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Standard RFC 4180-compliant CSV parser.
 * Correctly handles quotes, nested commas, and escaped double quotes.
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let col = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          col += '"';
          i++; // skip next quote
        } else {
          insideQuote = false;
        }
      } else {
        col += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ",") {
        row.push(col.trim());
        col = "";
      } else if (char === "\n" || char === "\r") {
        row.push(col.trim());
        if (row.some((c) => c !== "") || col !== "") {
          result.push(row);
        }
        row = [];
        col = "";
        if (char === "\r" && nextChar === "\n") {
          i++; // skip \n
        }
      } else {
        col += char;
      }
    }
  }

  if (row.length > 0 || col !== "") {
    row.push(col.trim());
    result.push(row);
  }

  return result;
}

export interface ParsedCSVRow {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "debit" | "credit";
  accountType?: "expenditure" | "savings";
}

/**
 * Maps rows of a CSV file to transaction items based on headers.
 */
export function mapRowsToTransactions(rows: string[][]): ParsedCSVRow[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const dateIdx = headers.indexOf("date");
  const descIdx = headers.indexOf("description");
  const catIdx = headers.indexOf("category");
  const amtIdx = headers.indexOf("amount");
  const typeIdx = headers.indexOf("type");
  const accIdx = headers.indexOf("account"); // Optional: matches 'expenditure' or 'savings'

  if (dateIdx === -1 || descIdx === -1 || amtIdx === -1 || typeIdx === -1) {
    throw new Error("Missing required headers in CSV. Headers must contain Date, Description, Amount, and Type.");
  }

  const transactions: ParsedCSVRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue; // skip short/empty rows

    const rawDate = row[dateIdx];
    const rawDesc = row[descIdx];
    const rawAmt = row[amtIdx];
    const rawType = row[typeIdx];

    if (!rawDate || !rawDesc || !rawAmt || !rawType) continue;

    const date = normalizeDate(rawDate);
    const description = rawDesc;
    const category = catIdx !== -1 && row[catIdx] ? row[catIdx] : "Other";
    
    // Amount parsing (handles negative floats like -120.50)
    let amount = parseFloat(rawAmt.replace(/[^\d.-]/g, ""));
    if (isNaN(amount)) continue;

    // Detect type and adjust amount sign
    let type: "debit" | "credit" = "debit";
    const typeStr = rawType.toLowerCase().trim();
    
    if (typeStr === "credit" || typeStr === "income") {
      type = "credit";
    } else if (typeStr === "debit" || typeStr === "expense" || typeStr === "expenditure") {
      type = "debit";
    } else {
      // Fallback: check negative amount sign
      type = amount < 0 ? "debit" : "credit";
    }

    amount = Math.abs(amount); // Keep amount absolute in database

    let accountType: "expenditure" | "savings" | undefined;
    if (accIdx !== -1 && row[accIdx]) {
      const accStr = row[accIdx].toLowerCase().trim();
      if (accStr === "savings" || accStr === "saving") {
        accountType = "savings";
      } else if (accStr === "expenditure" || accStr === "expense") {
        accountType = "expenditure";
      }
    }

    transactions.push({
      date,
      description,
      category,
      amount,
      type,
      accountType,
    });
  }

  return transactions;
}

interface ImportSummary {
  insertedCount: number;
  duplicateCount: number;
}

/**
 * Inserts parsed transactions into the database atomically.
 * Prevents duplicates by cross-referencing existing entries.
 */
export async function importTransactionsToDB(
  parsedTxs: ParsedCSVRow[],
  defaultAccountId: number,
  expenditureAccountId: number,
  savingsAccountId: number,
): Promise<ImportSummary> {
  // 1. Fetch all existing transactions to do duplicate checks
  const existingTxs = await db.transactions.toArray();

  let insertedCount = 0;
  let duplicateCount = 0;

  // 2. Wrap insertion in a Dexie write transaction
  await db.transaction("rw", [db.transactions, db.accounts], async () => {
    for (const item of parsedTxs) {
      // Determine account ID
      let accountId = defaultAccountId;
      if (item.accountType === "expenditure") {
        accountId = expenditureAccountId;
      } else if (item.accountType === "savings") {
        accountId = savingsAccountId;
      }

      // Check duplicates against database & already imported list
      const isDuplicate = existingTxs.some(
        (existing) =>
          existing.accountId === accountId &&
          existing.date === item.date &&
          Math.abs(existing.amount - item.amount) < 0.001 &&
          existing.type === item.type &&
          existing.description.toLowerCase().trim() === item.description.toLowerCase().trim()
      );

      if (isDuplicate) {
        duplicateCount++;
        continue;
      }

      // Add transaction
      const newTx: Omit<Transaction, "id"> = {
        accountId,
        date: item.date,
        description: item.description,
        category: item.category,
        amount: item.amount,
        type: item.type,
        createdAt: Date.now(),
      };

      await db.transactions.add(newTx);
      const delta = item.type === "credit" ? item.amount : -item.amount;
      await adjustBalance(accountId, delta);

      // Keep local reference updated during transaction loop
      existingTxs.push({ ...newTx, id: Math.random() });
      insertedCount++;
    }
  });

  return {
    insertedCount,
    duplicateCount,
  };
}
