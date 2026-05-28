import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { db, recordTransfer } from "../db/database";
import { todayISO, formatMonthYear, getMonthDateRange } from "../utils/dateUtils";
import { formatNumber } from "../utils/currency";

interface UseMonthInitProps {
  monthYear: string;
  isEdit: boolean;
  onSaved: () => void;
  onClose?: () => void;
}

export function useMonthInit({
  monthYear,
  isEdit,
  onSaved,
  onClose,
}: UseMonthInitProps) {
  const [expendBalance, setExpendBalance] = useState("");
  const [savingsBalance, setSavingsBalance] = useState("");
  const [budget, setBudget] = useState("");
  const [includeTransfer, setIncludeTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [loading, setLoading] = useState(isEdit); // start true only in edit mode
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({});
  const [showCatBudgets, setShowCatBudgets] = useState(false);

  const handleBlur = (val: string, setter: (v: string) => void) => {
    if (!val) return;
    const num = parseFloat(val.replace(/,/g, ""));
    if (!isNaN(num)) {
      setter(formatNumber(num, 2, 0));
    }
  };

  // In edit mode: load existing values asynchronously
  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    db.monthSetups
      .where("monthYear")
      .equals(monthYear)
      .first()
      .then(async (setup) => {
        if (cancelled) return;
        if (setup) {
          setExpendBalance(formatNumber(setup.openingBalance, 2, 0));
          setBudget(formatNumber(setup.monthlyBudget, 2, 0));
          if (
            setup.categoryBudgets &&
            Object.keys(setup.categoryBudgets).length > 0
          ) {
            const loaded: Record<string, string> = {};
            for (const [cat, amt] of Object.entries(setup.categoryBudgets)) {
              loaded[cat] = formatNumber(amt, 2, 0);
            }
            setCatBudgets(loaded);
            setShowCatBudgets(true);
          }
        }

        // Load savings balance in edit mode
        const savingsAcc = await db.accounts.where("type").equals("savings").first();
        if (savingsAcc && !cancelled) {
          setSavingsBalance(formatNumber(savingsAcc.currentBalance, 2, 0));
        }

        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        toast.error("Failed to load budget setup");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, monthYear]);

  // In new setup mode: pre-populate with current balances from DB to prevent overwrites
  useEffect(() => {
    if (isEdit) return;

    let cancelled = false;
    Promise.all([
      db.accounts.where("type").equals("expenditure").first(),
      db.accounts.where("type").equals("savings").first(),
    ]).then(([expendAcc, savingsAcc]) => {
      if (cancelled) return;
      if (expendAcc) {
        setExpendBalance(formatNumber(expendAcc.currentBalance, 2, 0));
      }
      if (savingsAcc) {
        setSavingsBalance(formatNumber(savingsAcc.currentBalance, 2, 0));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expBal = parseFloat(expendBalance.replace(/,/g, ""));
    const savBal = parseFloat(savingsBalance.replace(/,/g, ""));
    const monthBudget = parseFloat(budget.replace(/,/g, ""));

    if (isNaN(expBal)) {
      toast.error("Enter expenditure opening balance");
      return;
    }
    if (!monthBudget || monthBudget <= 0) {
      toast.error("Enter a valid monthly budget");
      return;
    }

    setLoading(true);
    try {
      const [expendAcc, savingsAcc] = await Promise.all([
        db.accounts.where("type").equals("expenditure").first(),
        db.accounts.where("type").equals("savings").first(),
      ]);

      if (!expendAcc?.id || !savingsAcc?.id)
        throw new Error("Accounts not found");

      if (isEdit) {
        const existingSetup = await db.monthSetups
          .where("[accountId+monthYear]")
          .equals([expendAcc.id, monthYear])
          .first();

        if (!existingSetup?.id) throw new Error("Setup record not found");

        // Build categoryBudgets map from non-zero entries
        const categoryBudgets: Record<string, number> = {};
        for (const [cat, val] of Object.entries(catBudgets)) {
          const n = parseFloat(val.replace(/,/g, ""));
          if (n > 0) categoryBudgets[cat] = n;
        }
        await db.monthSetups.update(existingSetup.id, {
          openingBalance: expBal,
          monthlyBudget: monthBudget,
          categoryBudgets,
        });
        // Recalculate Expenditure Account current balance based on the new opening balance and existing transactions
        const { startDate } = getMonthDateRange(monthYear);
        const expendTxs = await db.transactions
          .where("accountId")
          .equals(expendAcc.id)
          .filter((tx) => tx.date >= startDate)
          .toArray();
        let newExpendCurrent = expBal;
        for (const tx of expendTxs) {
          newExpendCurrent = tx.type === "credit" ? newExpendCurrent + tx.amount : newExpendCurrent - tx.amount;
        }
        await db.accounts.update(expendAcc.id, { currentBalance: +newExpendCurrent.toFixed(2) });

        // Apply savings balance adjustment in edit mode if it changed
        if (!isNaN(savBal) && savBal >= 0) {
          const savDiff = savBal - savingsAcc.currentBalance;
          if (savDiff !== 0) {
            await db.transactions.add({
              date: todayISO(),
              description: "Savings balance adjustment",
              amount: Math.abs(savDiff),
              type: savDiff > 0 ? "credit" : "debit",
              accountId: savingsAcc.id,
              category: "adjustment",
              createdAt: Date.now(),
            });
            await db.accounts.update(savingsAcc.id, { currentBalance: savBal });
          }
        }

        toast.success("Budget setup updated ✓");
      } else {
        // Calculate the current balance based on expBal (opening balance) and any transactions that already exist in the month
        const { startDate } = getMonthDateRange(monthYear);
        const existingTxs = await db.transactions
          .where("accountId")
          .equals(expendAcc.id)
          .filter((tx) => tx.date >= startDate)
          .toArray();
        let currentExpendBalance = expBal;
        for (const tx of existingTxs) {
          currentExpendBalance = tx.type === "credit" ? currentExpendBalance + tx.amount : currentExpendBalance - tx.amount;
        }
        await db.accounts.update(expendAcc.id, { currentBalance: +currentExpendBalance.toFixed(2) });
        if (!isNaN(savBal) && savBal >= 0) {
          const diff = savBal - savingsAcc.currentBalance;
          if (diff !== 0) {
            await db.transactions.add({
              date: todayISO(),
              description: "Savings balance adjustment",
              amount: Math.abs(diff),
              type: diff > 0 ? "credit" : "debit",
              accountId: savingsAcc.id,
              category: "adjustment",
              createdAt: Date.now(),
            });
          }
          await db.accounts.update(savingsAcc.id, { currentBalance: savBal });
        }

        // Build categoryBudgets map from non-zero entries
        const categoryBudgets: Record<string, number> = {};
        for (const [cat, val] of Object.entries(catBudgets)) {
          const n = parseFloat(val.replace(/,/g, ""));
          if (n > 0) categoryBudgets[cat] = n;
        }
        await db.monthSetups.add({
          monthYear,
          openingBalance: expBal,
          monthlyBudget: monthBudget,
          accountId: expendAcc.id,
          categoryBudgets,
        });

        if (includeTransfer && transferAmount) {
          const txAmt = parseFloat(transferAmount.replace(/,/g, ""));
          if (txAmt > 0)
            await recordTransfer(
              txAmt,
              todayISO(),
              "Opening transfer from Savings",
              "opening-transfer",
            );
        }

        toast.success(`${formatMonthYear(monthYear)} is set up!`);
      }

      onSaved();
      if (onClose) onClose();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    expendBalance,
    setExpendBalance,
    savingsBalance,
    setSavingsBalance,
    budget,
    setBudget,
    includeTransfer,
    setIncludeTransfer,
    transferAmount,
    setTransferAmount,
    loading,
    catBudgets,
    setCatBudgets,
    showCatBudgets,
    setShowCatBudgets,
    handleBlur,
    handleSubmit,
  };
}
