import { useState, useEffect, useRef } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";
import { getCurrentMonthYear } from "../../utils/dateUtils";
import { getSpendingWallet, db } from "../../db/database";
import toast from "react-hot-toast";

export function useIncomeWizard(isOpen: boolean, onComplete: () => void) {
  const { profile, updateProfile } = useProfile();
  const categoriesDb = useCategories();
  
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({});
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingOpeningBal, setExistingOpeningBal] = useState<number | null>(null);
  const [allocationType, setAllocationType] = useState<"savings" | "spending" | "split">("savings");
  const [savingsSplitAmount, setSavingsSplitAmount] = useState("");
  const [skippedIncome, setSkippedIncome] = useState(false);
  const [manualSpendingBal, setManualSpendingBal] = useState("");
  const [manualSavingsBal, setManualSavingsBal] = useState("");
  const [manualBudget, setManualBudget] = useState("");
  const hasInitialized = useRef(false);

  const calculateTotalBudget = () => {
    return Object.values(catBudgets).reduce((sum, val) => sum + (parseFloat(val.replace(/,/g, "")) || 0), 0);
  };

  const handleNext = () => {
    setStep((s) => {
      if (s === 2) {
        const incAmt = parseFloat(income.replace(/,/g, "")) || 0;
        const totalBudget = calculateTotalBudget();
        if (totalBudget >= incAmt) {
          return 4;
        }
      }
      return s + 1;
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      if (s === 4) {
        const incAmt = parseFloat(income.replace(/,/g, "")) || 0;
        const totalBudget = calculateTotalBudget();
        if (totalBudget >= incAmt) {
          return 2;
        }
      }
      return Math.max(1, s - 1);
    });
  };

  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      return;
    }

    if (hasInitialized.current) return;
    if (categoriesDb.length === 0) return;

    const loadData = async () => {
      if (profile?.monthlyIncome) {
        setIncome(profile.monthlyIncome.toString());
      }

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
          if (existingSetup.categoryBudgets) {
            Object.entries(existingSetup.categoryBudgets).forEach(([cat, val]) => {
              loadedBudgets[cat] = val.toString();
            });
          }
          
          const budgetableCategories = categoriesDb
            .map((c) => c.name)
            .filter((name) => name.toLowerCase() !== "transfer" && name.toLowerCase() !== "other");
            
          budgetableCategories.forEach(cat => {
            if (loadedBudgets[cat] === undefined) {
              loadedBudgets[cat] = "";
            }
          });
          
          setCatBudgets(loadedBudgets);
          hasInitialized.current = true;
          return;
        }
      }

      const budgetableCategories = categoriesDb
        .map((c) => c.name)
        .filter((name) => name.toLowerCase() !== "transfer" && name.toLowerCase() !== "other");
      
      const initialBudgets: Record<string, string> = {};
      budgetableCategories.forEach(cat => {
        initialBudgets[cat] = "";
      });
      setCatBudgets(initialBudgets);
      
      hasInitialized.current = true;
    };

    loadData();
  }, [isOpen, categoriesDb, profile]);

  const activeCategories = Object.keys(catBudgets);

  const handleAddCustomCategory = async () => {
    if (!newCatName.trim()) return;
    const name = newCatName.trim();
    if (catBudgets[name] !== undefined) {
      toast.error("Category already exists");
      return;
    }

    setCatBudgets(prev => ({
      ...prev,
      [name]: "",
    }));
    
    setNewCatName("");
  };

  const handleMoneyInputChange = (
    val: string,
    setter: (v: string) => void
  ) => {
    const raw = val.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      if (raw === "") {
        setter("");
        return;
      }
      const parts = raw.split(".");
      if (parts[0].length > 1 && parts[0].startsWith("0")) {
        parts[0] = parts[0].replace(/^0+/, "");
        if (parts[0] === "") parts[0] = "0";
      }
      let formatted = Number(parts[0]).toLocaleString("en-IN");
      if (parts.length > 1) {
        formatted += "." + parts[1].slice(0, 2);
      }
      setter(formatted);
    }
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
      let finalMonthlyBudget = 0;

      if (skippedIncome) {
        spendingAllocation = parseFloat(manualSpendingBal.replace(/,/g, "")) || 0;
        savingsAllocation = parseFloat(manualSavingsBal.replace(/,/g, "")) || 0;
        finalMonthlyBudget = parseFloat(manualBudget.replace(/,/g, "")) || spendingAllocation;
      } else {
        const inc = parseFloat(income.replace(/,/g, "")) || 0;
        updateProfileIncome = inc;
        
        for (const [cat, val] of Object.entries(catBudgets)) {
          const num = parseFloat(val.replace(/,/g, "")) || 0;
          if (num > 0) {
            parsedCatBudgets[cat] = num;
            totalBudget += num;
          }
        }
        
        const leftover = Math.max(0, inc - totalBudget);
        
        if (allocationType === "savings") {
          savingsAllocation = leftover;
        } else if (allocationType === "split") {
          savingsAllocation = Math.min(leftover, parseFloat(savingsSplitAmount.replace(/,/g, "")) || 0);
        }

        spendingAllocation = leftover - savingsAllocation;
        finalMonthlyBudget = spendingAllocation;
      }

      await updateProfile({
        monthlyIncome: updateProfileIncome || undefined,
        watchCategories: Object.keys(parsedCatBudgets),
        wizardCompleted: true,
      });

      const spendingAcc = await getSpendingWallet();
      if (!spendingAcc?.id) throw new Error("Spending account not found");

      const [year, month] = monthYear.split("-").map(Number);
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const txsSinceStart = await db.transactions
        .where("accountId")
        .equals(spendingAcc.id)
        .filter((tx) => tx.date >= startDate)
        .toArray();

      let currentExpendBalance = spendingAllocation;
      for (const tx of txsSinceStart) {
        currentExpendBalance = tx.type === "credit" ? currentExpendBalance + tx.amount : currentExpendBalance - tx.amount;
      }
      await db.accounts.update(spendingAcc.id, { currentBalance: +currentExpendBalance.toFixed(2) });

      await db.monthSetups.put({
        monthYear,
        openingBalance: spendingAllocation,
        monthlyBudget: finalMonthlyBudget,
        accountId: spendingAcc.id,
        categoryBudgets: parsedCatBudgets,
      });

      if (savingsAllocation > 0) {
        const savingsAcc = await db.accounts.where("type").equals("savings").first();
        if (savingsAcc?.id) {
          await db.accounts.update(savingsAcc.id, {
            currentBalance: (savingsAcc.currentBalance || 0) + savingsAllocation
          });
          
          await db.transactions.add({
            amount: savingsAllocation,
            type: "credit",
            category: "starting-transfer",
            date: `${monthYear}-01`,
            description: "Monthly Savings Allocation",
            accountId: savingsAcc.id,
            createdAt: Date.now()
          });
        }
      }

      toast.success(existingOpeningBal === null ? "Welcome to buckflo!" : "Setup updated!");
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete setup.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    income,
    setIncome,
    catBudgets,
    setCatBudgets,
    newCatName,
    setNewCatName,
    loading,
    allocationType,
    setAllocationType,
    savingsSplitAmount,
    setSavingsSplitAmount,
    skippedIncome,
    setSkippedIncome,
    manualSpendingBal,
    setManualSpendingBal,
    manualSavingsBal,
    setManualSavingsBal,
    manualBudget,
    setManualBudget,
    activeCategories,
    handleNext,
    handlePrev,
    handleAddCustomCategory,
    handleMoneyInputChange,
    handleFinish,
    calculateTotalBudget,
  };
}
