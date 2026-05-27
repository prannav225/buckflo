import { db, addTransaction } from "../db/database";
import { parseISO, addMonths, addWeeks, addYears, format } from "date-fns";
import toast from "react-hot-toast";

/**
 * Calculates the next due date based on current due date and frequency.
 */
export function advanceDueDate(dateStr: string, frequency: 'weekly' | 'monthly' | 'yearly'): string {
  try {
    const date = parseISO(dateStr);
    let nextDate;
    if (frequency === 'weekly') {
      nextDate = addWeeks(date, 1);
    } else if (frequency === 'yearly') {
      nextDate = addYears(date, 1);
    } else {
      // Default: monthly
      nextDate = addMonths(date, 1);
    }
    return format(nextDate, "yyyy-MM-dd");
  } catch (err) {
    console.error("Failed to parse due date:", dateStr, err);
    return dateStr;
  }
}

/**
 * Scans active subscriptions and automatically records transactions for those whose due date is today or past.
 */
export async function processAutopaySubscriptions(): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Fetch active subscriptions
  const activeSubs = await db.subscriptions
    .where("status")
    .equals("active")
    .toArray();

  if (activeSubs.length === 0) return 0;

  const expendAcc = await db.accounts.where("type").equals("expenditure").first();
  if (!expendAcc || !expendAcc.id) return 0;

  let processedCount = 0;

  for (const sub of activeSubs) {
    if (sub.nextDueDate <= todayStr) {
      try {
        // Run database mutations inside a transaction
        await db.transaction("rw", [db.transactions, db.accounts, db.subscriptions], async () => {
          // 1. Log the debit transaction
          await addTransaction({
            date: sub.nextDueDate, // Use the scheduled due date for historical accuracy
            description: `${sub.name} (Autopay)`,
            amount: sub.amount,
            type: "debit",
            accountId: expendAcc.id!,
            category: sub.category || "Other",
          });

          // 2. Advance the due date
          const nextDueDate = advanceDueDate(sub.nextDueDate, sub.frequency);
          await db.subscriptions.update(sub.id!, { nextDueDate });
        });

        toast.success(`Autopay executed: ${sub.name} (₹${sub.amount.toFixed(2)}) logged ✓`, {
          duration: 4000,
        });

        processedCount++;
      } catch (err) {
        console.error(`Failed to process autopay for subscription ${sub.name}:`, err);
      }
    }
  }

  return processedCount;
}
