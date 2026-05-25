import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAccount,
  useMonthSetup,
  useRecentTransactions,
  useMonthSummary,
  useTransactions,
} from "../db/hooks";
import {
  getCurrentMonthYear,
  getDaysRemainingInMonth,
} from "../utils/dateUtils";
import { useFrequentPresets } from "./useAnalytics";

export interface TransferConfig {
  direction: "savings_to_expenditure" | "expenditure_to_savings";
  amount: string;
  note: string;
}

export function useHomeData() {
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferConfig, setTransferConfig] = useState<TransferConfig>({
    direction: "savings_to_expenditure",
    amount: "",
    note: "",
  });

  const monthYear = getCurrentMonthYear();

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");
  const monthSetup = useMonthSetup(monthYear);
  const recentTxs = useRecentTransactions(undefined, 5);
  const allMonthTxs = useTransactions(expendAcc?.id, monthYear);
  const summary = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);

  const daysLeft = getDaysRemainingInMonth();
  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalDebited;
  const remaining = budget - spent;
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const dailyRemaining = daysLeft > 0 ? Math.max(0, remaining) / daysLeft : 0;

  // Analytics hooks
  const presets = useFrequentPresets(4);

  const handleTopUp = () => {
    setTransferConfig({
      direction: "savings_to_expenditure",
      amount: "",
      note: "Transfer to Expenditure",
    });
    setShowTransfer(true);
  };

  const handlePresetClick = (preset: {
    description: string;
    category: string;
    amount: number;
  }) => {
    navigate(
      `/add?desc=${encodeURIComponent(preset.description)}&cat=${encodeURIComponent(preset.category)}&amt=${preset.amount}`,
    );
  };

  return {
    navigate,
    showTransfer,
    setShowTransfer,
    transferConfig,
    setTransferConfig,
    monthYear,
    savingsAcc,
    monthSetup,
    recentTxs,
    summary,
    daysLeft,
    budget,
    spent,
    remaining,
    spentPct,
    overBudget,
    dailyRemaining,
    presets,
    handleTopUp,
    handlePresetClick,
  };
}
