import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronRight, Target } from "lucide-react";
import { DueDatePicker } from "../ui/DueDatePicker";
import { CurrencyInput } from "../ui/CurrencyInput";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { useProfile } from "../../hooks/useProfile";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { useCategories } from "../../hooks/useCategories";
import { getSpendingWallet, db } from "../../db/database";
import { useBackHandler } from "../../hooks/useBackHandler";
import toast from "react-hot-toast";

interface IncomeWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

export function IncomeWizard({
  isOpen,
  onComplete,
  onClose,
}: IncomeWizardProps) {
  const { profile, updateProfile } = useProfile();
  const categoriesDb = useCategories();

  useBackHandler(isOpen && !!onClose, () => {
    if (onClose) onClose();
  });

  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  // Replaces fixed commitments with a full category map
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({});
  const [catDueDays, setCatDueDays] = useState<
    Record<string, number | undefined>
  >({});
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingOpeningBal, setExistingOpeningBal] = useState<number | null>(
    null,
  );
  const [allocationType, setAllocationType] = useState<
    "savings" | "spending" | "split"
  >("savings");
  const [savingsSplitAmount, setSavingsSplitAmount] = useState("");
  const [skippedIncome, setSkippedIncome] = useState(false);
  const [manualSpendingBal, setManualSpendingBal] = useState("");
  const [manualSavingsBal, setManualSavingsBal] = useState("");
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (isOpen) {
      updateSheetOpenState();
    }
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen]);

  const handleNext = () => {
    setStep((s) => {
      if (s === 2) {
        if (skippedIncome) return 5; // Go to manual balance entry
        const incAmt = parseFloat(income.replace(/,/g, "")) || 0;
        const totalBudget = calculateTotalBudget();
        if (totalBudget >= incAmt) {
          return 4; // Skip Step 3 ("What about the rest?") if total budget eats up/exceeds income
        }
      }
      return s + 1;
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      if (s === 2 && skippedIncome) {
        setSkippedIncome(false);
        return 1;
      }
      if (s === 5 && skippedIncome) {
        return 2;
      }
      if (s === 4) {
        const incAmt = parseFloat(income.replace(/,/g, "")) || 0;
        const totalBudget = calculateTotalBudget();
        if (totalBudget >= incAmt) {
          return 2; // Skip Step 3 when going back if budget >= income
        }
      }
      return Math.max(1, s - 1);
    });
  };

  // Initialize data from profile and existing month setup
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      return;
    }

    if (hasInitialized.current) return;
    if (categoriesDb.length === 0) return; // Wait for categories to finish loading from DB

    const loadData = async () => {
      // 1. Load Income from Profile
      if (profile?.monthlyIncome) {
        setIncome(profile.monthlyIncome.toString());
      }

      // 2. Load Existing Month Setup if editing
      const monthYear = getCurrentMonthYear();
      const spendingAcc = await getSpendingWallet();
      if (spendingAcc?.id) {
        const existingSetup = await db.monthSetups
          .where("[accountId+monthYear]")
          .equals([spendingAcc.id, monthYear])
          .first();

        if (existingSetup) {
          setExistingOpeningBal(existingSetup.openingBalance);

          const loadedBudgets: Record<string, string> = {};
          const loadedDueDays: Record<string, number | undefined> = {};
          if (existingSetup.categoryBudgets) {
            Object.entries(existingSetup.categoryBudgets).forEach(
              ([cat, val]) => {
                loadedBudgets[cat] = val.toString();
              },
            );
          }
          // Load due days from committedExpenses if they exist
          if (existingSetup.committedExpenses) {
            for (const ce of existingSetup.committedExpenses) {
              loadedDueDays[ce.name] = ce.dueDay;
            }
          }

          const budgetableCategories = categoriesDb
            .map((c) => c.name)
            .filter(
              (name) =>
                name.toLowerCase() !== "transfer" &&
                name.toLowerCase() !== "other",
            );

          budgetableCategories.forEach((cat) => {
            if (loadedBudgets[cat] === undefined) {
              loadedBudgets[cat] = "";
            }
          });

          setCatBudgets(loadedBudgets);
          setCatDueDays(loadedDueDays);
          hasInitialized.current = true;
          return;
        }
      }

      // 3. Fallback to empty initialization if no existing setup
      const budgetableCategories = categoriesDb
        .map((c) => c.name)
        .filter(
          (name) =>
            name.toLowerCase() !== "transfer" && name.toLowerCase() !== "other",
        );

      const initial: Record<string, string> = {};
      budgetableCategories.forEach((cat) => (initial[cat] = ""));
      setCatBudgets(initial);
      hasInitialized.current = true;
    };

    loadData();
  }, [isOpen, categoriesDb, profile]);

  const activeCategories = Object.keys(catBudgets);

  const handleAddCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    // Auto-save to categories table so it persists
    await db.categories.add({
      name: newCatName.trim(),
      color: "#9d9d99", // Default color
      isCustom: true,
      createdAt: Date.now(),
    });

    setCatBudgets((prev) => ({ ...prev, [newCatName.trim()]: "" }));
    setNewCatName("");
  };


  const calculateTotalBudget = () => {
    return Object.values(catBudgets).reduce(
      (sum, val) => sum + (parseFloat(val.replace(/,/g, "")) || 0),
      0,
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const monthYear = getCurrentMonthYear();

      const parsedCatBudgets: Record<string, number> = {};
      let totalBudget = 0;
      let spendingAllocation = 0;
      let savingsAllocation = 0;
      let updateProfileIncome = 0;

      // Parse category budgets universally so committed expenses are always saved
      for (const [cat, val] of Object.entries(catBudgets)) {
        const num = parseFloat(val.replace(/,/g, "")) || 0;
        if (num > 0) {
          parsedCatBudgets[cat] = num;
          totalBudget += num;
        }
      }

      if (skippedIncome) {
        spendingAllocation =
          parseFloat(manualSpendingBal.replace(/,/g, "")) || 0;
        savingsAllocation = parseFloat(manualSavingsBal.replace(/,/g, "")) || 0;
      } else {
        const inc = parseFloat(income.replace(/,/g, "")) || 0;
        updateProfileIncome = inc;

        const leftover = Math.max(0, inc - totalBudget);

        if (allocationType === "savings") {
          savingsAllocation = leftover;
        } else if (allocationType === "split") {
          savingsAllocation = Math.min(
            leftover,
            parseFloat(savingsSplitAmount.replace(/,/g, "")) || 0,
          );
        }

        spendingAllocation = leftover - savingsAllocation;
      }

      // 1. Update Profile
      await updateProfile({
        monthlyIncome: updateProfileIncome || undefined,
        watchCategories: Object.keys(parsedCatBudgets),
        wizardCompleted: true,
      });

      // 2. Initialize Month Setup
      const spendingAcc = await getSpendingWallet();
      if (!spendingAcc?.id) throw new Error("Spending account not found");

      // Update spending wallet balance by recalculating it with the new opening balance
      const [year, month] = monthYear.split("-").map(Number);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const txsSinceStart = await db.transactions
        .where("accountId")
        .equals(spendingAcc.id)
        .filter((tx) => tx.date >= startDate)
        .toArray();

      let currentExpendBalance = spendingAllocation;
      for (const tx of txsSinceStart) {
        currentExpendBalance =
          tx.type === "credit"
            ? currentExpendBalance + tx.amount
            : currentExpendBalance - tx.amount;
      }
      await db.accounts.update(spendingAcc.id, {
        currentBalance: +currentExpendBalance.toFixed(2),
      });

      // Build committedExpenses array from catBudgets with amounts > 0
      const committedExpensesList = Object.entries(parsedCatBudgets).map(
        ([cat, amount]) => ({
          name: cat,
          category: cat,
          amount,
          dueDay: catDueDays[cat],
          isPaid: false,
          paidDate: undefined as string | undefined,
          transactionId: undefined as number | undefined,
        }),
      );

      // Preserve paid status from existing setup if editing
      const existingSetupForMerge = await db.monthSetups
        .where("[accountId+monthYear]")
        .equals([spendingAcc.id, monthYear])
        .first();
      if (existingSetupForMerge?.committedExpenses) {
        for (const ce of committedExpensesList) {
          const existing = existingSetupForMerge.committedExpenses.find(
            (e) => e.name === ce.name && e.amount === ce.amount,
          );
          if (existing?.isPaid) {
            ce.isPaid = true;
            ce.paidDate = existing.paidDate;
            ce.transactionId = existing.transactionId;
          }
        }
      }

      // Use PUT to safely insert or update
      await db.monthSetups.put({
        monthYear,
        openingBalance: spendingAllocation,
        monthlyBudget: spendingAllocation,
        accountId: spendingAcc.id,
        categoryBudgets: {},
        committedExpenses: committedExpensesList,
      });

      // 3. Handle Savings Wallet
      if (savingsAllocation > 0) {
        const savingsAcc = await db.accounts
          .where("type")
          .equals("savings")
          .first();
        if (savingsAcc?.id) {
          await db.accounts.update(savingsAcc.id, {
            currentBalance:
              (savingsAcc.currentBalance || 0) + savingsAllocation,
          });

          // Log an initial starting transfer for this month
          await db.transactions.add({
            amount: savingsAllocation,
            type: "credit",
            category: "starting-transfer",
            date: `${monthYear}-01`,
            description: "Monthly Savings Allocation",
            accountId: savingsAcc.id,
            createdAt: Date.now(),
          });
        }
      }

      toast.success(
        existingOpeningBal === null ? "Welcome to buckflo!" : "Setup updated!",
      );
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-2xl mx-auto w-full fade-in h-full">
            <h2 className="font-display text-4xl sm:text-5xl font-light! text-center text-(--text) mb-4">
              What's your monthly income?
            </h2>
            <p className="text-base sm:text-lg text-(--text-muted) text-center mb-12 max-w-md leading-relaxed">
              We use this to figure out how much you can comfortably spend and
              save each month.
            </p>
            <div className="relative w-full max-w-xs mb-16">
              <span className="absolute left-0 bottom-4 text-2xl sm:text-3xl text-(--text-muted) font-light">
                ₹
              </span>
              <CurrencyInput
                placeholder="0"
                value={income}
                onChange={(val) => setIncome(val)}
                className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 text-5xl! font-display font-medium pl-4 pb-3 focus:border-(--accent) outline-none transition-colors text-(--text)"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button
                className="btn-primary w-full h-[56px] text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={handleNext}
                disabled={!income}
              >
                Continue
              </button>
              <button
                className="text-sm font-semibold text-(--text-muted) hover:text-(--text) transition-colors py-2"
                onClick={() => {
                  setSkippedIncome(true);
                  setStep(2);
                }}
              >
                Skip / I'd rather not share
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex-1 flex flex-col px-6 max-w-2xl mx-auto w-full fade-in pt-8 sm:pt-16 pb-32 overflow-y-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-light! text-(--text) mb-3">
              Committed Expenses
            </h2>
            <p className="text-base text-(--text-muted) mb-8 leading-relaxed">
              Enter your fixed, inevitable spends. These are deducted
              automatically from your income so you know your true leftover
              spending wallet.
            </p>

            <div className="flex flex-col gap-6">
              {activeCategories.map((cat, index) => (
                <div
                  key={cat}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 gap-4 relative group"
                  style={{ zIndex: activeCategories.length - index }}
                >
                  <span className="font-sans text-lg font-medium text-(--text)">
                    {cat}
                  </span>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-36 flex items-center justify-end">
                      <span className="text-lg text-(--text-muted) mr-1">
                        ₹
                      </span>
                      <CurrencyInput
                        placeholder="0"
                        value={catBudgets[cat] || ""}
                        onChange={(val) =>
                          setCatBudgets((prev) => ({
                            ...prev,
                            [cat]: val,
                          }))
                        }
                        className="w-full sm:w-24 bg-transparent border-none text-xl font-semibold text-right outline-none placeholder:text-black/20 dark:placeholder:text-white/20 text-(--text)"
                      />
                    </div>
                    <DueDatePicker
                      value={catDueDays[cat]}
                      onChange={(val) =>
                        setCatDueDays((prev) => ({ ...prev, [cat]: val }))
                      }
                    />
                  </div>
                </div>
              ))}

              {/* Custom Category Creator */}
              <div className="flex items-center gap-4 mt-2 border-b border-dashed border-black/10 dark:border-white/10 pb-4">
                <form
                  onSubmit={handleAddCustomCategory}
                  className="flex gap-3 w-full items-center"
                >
                  <input
                    type="text"
                    placeholder="Add custom category..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-(--text-muted) font-medium text-(--text)"
                  />
                  {newCatName.trim() && (
                    <button
                      type="submit"
                      className="text-sm font-bold text-(--accent) uppercase tracking-wider px-4 py-1.5 bg-(--accent)/10 rounded-full hover:bg-(--accent)/20 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-white via-white dark:from-[#151515] dark:via-[#151515] to-transparent z-50 pointer-events-none">
              <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                <button
                  className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-(--text) backdrop-blur-md"
                  onClick={handlePrev}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  className="flex-1 h-14 rounded-full bg-(--text) dark:bg-white text-white dark:text-black font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  onClick={handleNext}
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      case 3: {
        const incForLeftover = parseFloat(income.replace(/,/g, "")) || 0;
        const budgetForLeftover = calculateTotalBudget();
        const leftoverAmount = Math.max(0, incForLeftover - budgetForLeftover);

        return (
          <div className="flex-1 flex flex-col px-6 max-w-2xl mx-auto w-full fade-in pt-8 sm:pt-16 pb-32 overflow-y-auto">
            <h2 className="font-display text-4xl sm:text-5xl font-light! text-center text-(--text) mb-10">
              What about the rest?
            </h2>

            <div className="flex flex-col items-center mb-12">
              <span className="text-[10px] font-bold text-(--accent) uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-(--accent)/10 border border-(--accent)/20">
                Unassigned Leftover
              </span>
              <span className="font-display text-5xl font-semibold text-(--text)">
                ₹{new Intl.NumberFormat("en-IN").format(leftoverAmount)}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div
                role="button"
                onClick={() => setAllocationType("savings")}
                className={`p-5 text-left border rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                  allocationType === "savings"
                    ? "border-(--accent) bg-(--accent)/5 shadow-sm"
                    : "border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative z-10">
                  <p className="text-lg font-semibold text-(--text) mb-1">
                    Move to Savings
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    Set it all aside for your future goals
                  </p>
                </div>
              </div>

              <div
                role="button"
                onClick={() => setAllocationType("spending")}
                className={`p-5 text-left border rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                  allocationType === "spending"
                    ? "border-(--text) bg-black/5 dark:bg-white/5 shadow-sm"
                    : "border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative z-10">
                  <p className="text-lg font-semibold text-(--text) mb-1">
                    Keep it flexible
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    Leave it in your spending wallet
                  </p>
                </div>
              </div>

              <div
                role="button"
                onClick={() => setAllocationType("split")}
                className={`p-5 text-left border rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                  allocationType === "split"
                    ? "border-(--accent) bg-(--accent)/5 shadow-sm"
                    : "border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative z-10">
                  <p
                    className={`text-lg font-semibold text-(--text) ${allocationType === "split" ? "mb-4" : "mb-0"}`}
                  >
                    Split it
                  </p>
                  {allocationType === "split" && (
                    <div
                      className="flex items-center gap-3 bg-white dark:bg-[#1f1f1e] rounded-xl px-4 py-3 border border-black/5 dark:border-white/5 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-sm font-semibold text-(--text-muted) whitespace-nowrap uppercase tracking-wider">
                        To Savings:
                      </span>
                      <div className="flex items-center text-xl font-semibold text-(--text) w-full justify-end">
                        <span className="text-(--text-muted) mr-1">₹</span>
                        <CurrencyInput
                          placeholder={new Intl.NumberFormat("en-IN").format(
                            leftoverAmount,
                          )}
                          value={savingsSplitAmount}
                          onChange={(val) => setSavingsSplitAmount(val)}
                          className="bg-transparent border-none outline-none w-full sm:w-32 text-right font-semibold text-xl text-(--text)"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-white via-white dark:from-[#151515] dark:via-[#151515] to-transparent z-50 pointer-events-none">
              <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                <button
                  className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-(--text) backdrop-blur-md"
                  onClick={handlePrev}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  className="flex-1 h-14 rounded-full bg-(--text) dark:bg-white text-white dark:text-black font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  onClick={handleNext}
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 4: {
        const incAmt = parseFloat(income.replace(/,/g, "")) || 0;
        const totalBudget = calculateTotalBudget();
        const leftoverForSummary = Math.max(0, incAmt - totalBudget);
        let finalSavings = 0;
        if (allocationType === "savings") finalSavings = leftoverForSummary;
        else if (allocationType === "split")
          finalSavings = Math.min(
            leftoverForSummary,
            parseFloat(savingsSplitAmount.replace(/,/g, "")) || 0,
          );

        const spendingBudget = leftoverForSummary - finalSavings;

        return (
          <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-2xl mx-auto w-full fade-in h-full">
            <div className="w-20 h-20 rounded-full bg-(--credit)/10 flex items-center justify-center mb-8 animate-in zoom-in duration-500 delay-100">
              <Target size={40} className="text-(--credit)" />
            </div>
            <h2 className="text-5xl font-display italic font-light! text-(--text) mb-4 text-center">
              You're all set!
            </h2>
            <p className="text-lg text-(--text-muted) mb-12 text-center max-w-sm">
              Your flexible spending budget is{" "}
              <strong className="text-(--text)">
                ₹{spendingBudget.toLocaleString()}
              </strong>{" "}
              for this month.
            </p>

            {finalSavings > 0 && (
              <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-3xl w-full max-w-sm text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
                <p className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider mb-2">
                  Moved to Savings
                </p>
                <p className="text-3xl font-semibold text-(--credit)">
                  ₹{finalSavings.toLocaleString()}
                </p>
              </div>
            )}

            <div className="fixed bottom-0 left-0 w-full p-6 z-50 pointer-events-none">
              <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                <button
                  className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-(--text) backdrop-blur-md"
                  onClick={handlePrev}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  className="flex-1 h-14 rounded-full bg-(--accent) text-white font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  onClick={handleFinish}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Start Journey"}
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 5:
        return (
          <div className="flex-1 flex flex-col px-6 max-w-2xl mx-auto w-full fade-in pt-8 sm:pt-16 pb-32 overflow-y-auto">
            <h2 className="font-display text-4xl sm:text-5xl font-light! text-(--text) mb-4 text-center">
              Initial Balances
            </h2>
            <p className="text-base sm:text-lg text-(--text-muted) mb-12 text-center max-w-md mx-auto leading-relaxed">
              Since you skipped the income step, please provide the opening
              balances for your wallets directly.
            </p>

            <div className="mb-10 w-full max-w-sm mx-auto">
              <label className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider mb-3 block text-center">
                Spending Wallet Balance
              </label>
              <div className="relative w-full">
                <span className="absolute left-0 bottom-3 text-2xl text-(--text-muted) font-light">
                  ₹
                </span>
                <CurrencyInput
                  placeholder="0"
                  value={manualSpendingBal}
                  onChange={(val) => setManualSpendingBal(val)}
                  className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 text-3xl! font-display font-light! text-left pl-4 pb-3 focus:border-(--accent) outline-none transition-colors text-(--text)"
                  autoFocus
                />
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto">
              <label className="text-sm font-semibold text-(--text-muted) uppercase tracking-wider mb-3 block text-center">
                Savings Wallet Balance{" "}
                <span className="text-xs font-normal opacity-70">
                  (Optional)
                </span>
              </label>
              <div className="relative w-full">
                <span className="absolute left-0 bottom-3 text-2xl text-(--text-muted) font-light">
                  ₹
                </span>
                <CurrencyInput
                  placeholder="0"
                  value={manualSavingsBal}
                  onChange={(val) => setManualSavingsBal(val)}
                  className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 text-3xl! font-display font-light! text-left pl-4 pb-3 focus:border-(--accent) outline-none transition-colors text-(--text)"
                />
              </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-white via-white dark:from-[#151515] dark:via-[#151515] to-transparent z-50 pointer-events-none">
              <div className="max-w-2xl mx-auto flex gap-4 pointer-events-auto">
                <button
                  className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-(--text) backdrop-blur-md"
                  onClick={handlePrev}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  className="flex-1 h-14 rounded-full bg-(--text) dark:bg-white text-white dark:text-black font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  onClick={handleFinish}
                  disabled={loading || !manualSpendingBal}
                >
                  {loading ? "Saving..." : "Start Journey"}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-999 bg-[#f8f8f6]/95 dark:bg-[#151515]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      {/* Sleek top progress bar replacing the pills */}
      <div className="w-full h-1 bg-black/5 dark:bg-white/5 fixed top-0 left-0 z-50">
        <div
          className="h-full bg-(--accent) transition-all duration-500 ease-out"
          style={{ width: `${(step / (skippedIncome ? 2 : 4)) * 100}%` }}
        />
      </div>

      {/* Header with Step indicator & Close Button */}
      <div className="flex justify-between items-center p-6 shrink-0 w-full max-w-2xl mx-auto absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full backdrop-blur-md">
          Step {step} of {skippedIncome ? 2 : 4}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-(--text) hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer pointer-events-auto backdrop-blur-md"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full pt-16">
        {renderStep()}
      </div>
    </div>,
    document.body,
  );
}
