import { useEffect } from "react";
import { db } from "../db/database";

export function useDatabaseSync(isOnboarded: boolean) {
  useEffect(() => {
    if (!isOnboarded) return;

    const healBalances = async () => {
      try {
        const [expendAcc, savingsAcc] = await Promise.all([
          db.accounts.where("type").equals("expenditure").first(),
          db.accounts.where("type").equals("savings").first(),
        ]);

        if (!expendAcc || !savingsAcc) return;

        // 1. Reconcile Savings Account
        // Sum all transactions belonging to the Savings Account
        const savingsTxs = await db.transactions
          .where("accountId")
          .equals(savingsAcc.id!)
          .toArray();

        let calculatedSavings = 0;
        for (const tx of savingsTxs) {
          calculatedSavings =
            tx.type === "credit"
              ? calculatedSavings + tx.amount
              : calculatedSavings - tx.amount;
        }
        calculatedSavings = +calculatedSavings.toFixed(2);

        if (savingsAcc.currentBalance !== calculatedSavings) {
          console.log(
            `[Sync] Healing Savings balance: ${savingsAcc.currentBalance} -> ${calculatedSavings}`
          );
          await db.accounts.update(savingsAcc.id!, {
            currentBalance: calculatedSavings,
          });
        }

        // 2. Reconcile Expenditure Account
        // Find the latest setup in monthSetups
        const latestSetup = await db.monthSetups
          .orderBy("monthYear")
          .last();

        let calculatedExpenditure = 0;
        if (latestSetup) {
          // Calculate from the opening balance of the setup + subsequent transactions
          const startDate = `${latestSetup.monthYear}-01`;
          const expendTxs = await db.transactions
            .where("accountId")
            .equals(expendAcc.id!)
            .filter((tx) => tx.date >= startDate)
            .toArray();

          calculatedExpenditure = latestSetup.openingBalance;
          for (const tx of expendTxs) {
            calculatedExpenditure =
              tx.type === "credit"
                ? calculatedExpenditure + tx.amount
                : calculatedExpenditure - tx.amount;
          }
        } else {
          // Fallback: sum all expenditure transactions if no setup exists
          const expendTxs = await db.transactions
            .where("accountId")
            .equals(expendAcc.id!)
            .toArray();

          for (const tx of expendTxs) {
            calculatedExpenditure =
              tx.type === "credit"
                ? calculatedExpenditure + tx.amount
                : calculatedExpenditure - tx.amount;
          }
        }
        calculatedExpenditure = +calculatedExpenditure.toFixed(2);

        if (expendAcc.currentBalance !== calculatedExpenditure) {
          console.log(
            `[Sync] Healing Expenditure balance: ${expendAcc.currentBalance} -> ${calculatedExpenditure}`
          );
          await db.accounts.update(expendAcc.id!, {
            currentBalance: calculatedExpenditure,
          });
        }
      } catch (err) {
        console.error("[Sync] Balance reconciliation failed:", err);
      }
    };

    // Run 500ms after load/onboard to allow state initialization to settle
    const timer = setTimeout(() => {
      healBalances();
    }, 500);

    return () => clearTimeout(timer);
  }, [isOnboarded]);
}
