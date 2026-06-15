import { useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { db, addTransaction } from "../db/database";
import type { MonthSetup, Account } from "../db/schema";

export function useCommittedExpenses(
  monthSetup: MonthSetup | null | undefined,
  spendingAcc: Account | undefined,
) {
  const handleMarkAsPaid = useCallback(
    async (expenseIdx: number) => {
      if (!monthSetup || !spendingAcc?.id) return;
      const expenses = monthSetup.committedExpenses;
      if (!expenses || !expenses[expenseIdx]) return;
      const expense = expenses[expenseIdx];

      try {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const txId = await addTransaction({
          date: todayStr,
          description: `${expense.name} (Committed)`,
          amount: expense.amount,
          type: "debit",
          accountId: spendingAcc.id,
          category: expense.category,
          isCommitted: true,
        });

        // Update the monthSetup with paid status
        const updatedExpenses = [...expenses];
        updatedExpenses[expenseIdx] = {
          ...expense,
          isPaid: true,
          paidDate: todayStr,
          transactionId: txId,
        };

        await db.monthSetups
          .where("[accountId+monthYear]")
          .equals([spendingAcc.id, monthSetup.monthYear])
          .modify({ committedExpenses: updatedExpenses });

        toast.success(`${expense.name} marked as paid`);
      } catch (err) {
        console.error("Failed to mark as paid:", err);
        toast.error("Failed to mark as paid");
      }
    },
    [monthSetup, spendingAcc],
  );

  const handleUndoPaid = useCallback(
    async (expenseIdx: number) => {
      if (!monthSetup || !spendingAcc?.id) return;
      const expenses = monthSetup.committedExpenses;
      if (!expenses || !expenses[expenseIdx]) return;
      const expense = expenses[expenseIdx];

      try {
        // Delete the associated transaction
        if (expense.transactionId) {
          await db.transactions.delete(expense.transactionId);
        }

        // Update the monthSetup
        const updatedExpenses = [...expenses];
        updatedExpenses[expenseIdx] = {
          ...expense,
          isPaid: false,
          paidDate: undefined,
          transactionId: undefined,
        };

        await db.monthSetups
          .where("[accountId+monthYear]")
          .equals([spendingAcc.id, monthSetup.monthYear])
          .modify({ committedExpenses: updatedExpenses });

        toast.success(`${expense.name} unmarked`);
      } catch (err) {
        console.error("Failed to undo:", err);
        toast.error("Failed to undo");
      }
    },
    [monthSetup, spendingAcc],
  );

  const committedTotal =
    monthSetup?.committedExpenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  
  const committedPaid =
    monthSetup?.committedExpenses
      ?.filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return {
    handleMarkAsPaid,
    handleUndoPaid,
    committedTotal,
    committedPaid,
  };
}
