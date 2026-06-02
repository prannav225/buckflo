import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/database";

export interface FrequentPreset {
  description: string;
  amount: number;
  category: string;
  isCustom: boolean;
  id?: number;
}

let isSeedingPresets = false;

export function useFrequentPresets(limit = 6): FrequentPreset[] {
  useEffect(() => {
    const seedAndDeduplicate = async () => {
      if (isSeedingPresets) return;
      isSeedingPresets = true;
      try {
        const allPresets = await db.presets.toArray();
        const seen = new Set<string>();
        const toDelete: number[] = [];

        for (const p of allPresets) {
          const key = `${p.name.trim().toLowerCase()}_${p.amount}_${p.category.trim().toLowerCase()}`;
          if (seen.has(key)) {
            if (p.id !== undefined) {
              toDelete.push(p.id);
            }
          } else {
            seen.add(key);
          }
        }

        if (toDelete.length > 0) {
          await db.presets.bulkDelete(toDelete);
        }

        const presetCount = await db.presets.count();
        if (presetCount === 0) {
          const spendingAccDb = await db.accounts
            .where("type")
            .equals("spending")
            .first();
          if (spendingAccDb?.id) {
            const now = Date.now();
            await db.presets.bulkAdd([
              {
                name: "Coffee",
                amount: 80,
                category: "Food",
                accountId: spendingAccDb.id,
                isCustom: false,
                usageCount: 0,
                createdAt: now,
              },
              {
                name: "Metro Fare",
                amount: 50,
                category: "Transport",
                accountId: spendingAccDb.id,
                isCustom: false,
                usageCount: 0,
                createdAt: now + 1,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error seeding or deduplicating presets:", err);
      } finally {
        isSeedingPresets = false;
      }
    };
    seedAndDeduplicate().catch(console.error);
  }, []);

  return useLiveQuery(
    async () => {
      const customPresets = await db.presets.toArray();

      const sortedPresets = [...customPresets]
        .sort((a, b) => {
          if (b.usageCount !== a.usageCount) {
            return (b.usageCount || 0) - (a.usageCount || 0);
          }
          return (b.createdAt || 0) - (a.createdAt || 0);
        })
        .map((p) => {
          const res: FrequentPreset = {
            description: p.name,
            amount: p.amount,
            category: p.category,
            isCustom: p.isCustom,
          };
          if (p.id !== undefined) res.id = p.id;
          return res;
        });

      return sortedPresets.slice(0, limit);
    },
    [limit],
    [],
  );
}
