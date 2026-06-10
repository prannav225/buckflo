import { toast } from "react-hot-toast";
import { db } from "../db/database";
import { hapticFeedback } from "../utils/haptics";
import type { FrequentPreset } from "./analytics";
import { todayISO } from "../utils/dateUtils";

export function useQuickPresetLog() {
  async function logQuickPreset(frequentPreset: FrequentPreset) {
    if (!frequentPreset.id) return;

    try {
      const preset = await db.presets.get(frequentPreset.id);
      if (!preset) {
        toast.error("Preset not found");
        return;
      }

      // Create transaction from preset
      const transaction = {
        date: todayISO(),
        description: preset.name,
        amount: preset.amount,
        type: "debit" as const,
        accountId: preset.accountId,
        category: preset.category,
        createdAt: Date.now(),
      };

      // Add to DB
      await db.transactions.add(transaction);

      // Update preset usage count
      await db.presets.update(preset.id!, {
        usageCount: (preset.usageCount || 0) + 1,
      });

      // Update account balance (sync)
      const account = await db.accounts.get(preset.accountId);
      if (account) {
        await db.accounts.update(preset.accountId, {
          currentBalance: account.currentBalance - preset.amount,
        });
      }

      // Haptic feedback
      hapticFeedback.medium();

      // Simple normal success toast
      toast.success(`${preset.name} logged`);
    } catch (error) {
      toast.error("Failed to log transaction");
      console.error(error);
    }
  }

  return { logQuickPreset };
}
