import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Wallet, Upload, Database, X, Plus, Zap, Trash2 } from "lucide-react";
import { db, deletePreset, incrementPresetUsage } from "../db/database";
import { ImportModal } from "../components/transactions/ImportModal";
import {
  useAccount,
  useMonthSetup,
  useRecentTransactions,
  useMonthSummary,
  useTransactions,
} from "../db/hooks";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { TransferSheet } from "../components/transactions/TransferSheet";
import { MonthInitModal } from "../components/MonthInitModal";
import {
  DashboardHeroCard,
  SavingsQuickCard,
} from "../components/DashboardCards";
import {
  getCurrentMonthYear,
  getDaysRemainingInMonth,
} from "../utils/dateUtils";
import { formatINR } from "../utils/currency";
import { useFrequentPresets, type FrequentPreset } from "../hooks/useAnalytics";
import { useMonthComparison } from "../hooks/useMonthComparison";
import { CreatePresetSheet } from "../components/transactions/CreatePresetSheet";
import toast from "react-hot-toast";
import { useProfile } from "../hooks/useProfile";


export function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [showTransfer, setShowTransfer] = useState(false);
  const [showMonthInit, setShowMonthInit] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImportDismissed, setIsImportDismissed] = useState(
    () => localStorage.getItem("flo_import_dismissed") === "true",
  );
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [longPressPreset, setLongPressPreset] = useState<number | null>(null);

  const handleDismissImportCard = () => {
    localStorage.setItem("flo_import_dismissed", "true");
    setIsImportDismissed(true);
  };

  useEffect(() => {
    const checkEmptyDB = async () => {
      try {
        const allTxs = await db.transactions.toArray();
        const realTxs = allTxs.filter(
          (tx) =>
            tx.category !== "adjustment" &&
            tx.category !== "transfer" &&
            tx.category !== "opening-transfer"
        );
        if (realTxs.length === 0) {
          localStorage.removeItem("flo_import_dismissed");
          setIsImportDismissed(false);
        }
      } catch (err) {
        console.error("Failed to check database transaction records:", err);
      }
    };
    checkEmptyDB();
  }, []);

  const [transferConfig, setTransferConfig] = useState<{
    direction: "savings_to_expenditure" | "expenditure_to_savings";
    amount: string;
    note: string;
  }>({
    direction: "savings_to_expenditure",
    amount: "",
    note: "",
  });

  const handleTopUp = () => {
    setTransferConfig({
      direction: "savings_to_expenditure",
      amount: "",
      note: "Transfer to Expenditure",
    });
    setShowTransfer(true);
  };

  const monthYear = getCurrentMonthYear();

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");
  const monthSetup = useMonthSetup(monthYear);
  const recentTxs = useRecentTransactions(undefined, 5);
  const allMonthTxs = useTransactions(expendAcc?.id, monthYear);
  const summary = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);
  const monthComparison = useMonthComparison();

  const daysLeft = getDaysRemainingInMonth();
  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalExpense;
  const remaining = budget - spent;
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const dailyRemaining = daysLeft > 0 ? Math.max(0, remaining) / daysLeft : 0;

  // Analytics hooks — 6 presets max
  const presets = useFrequentPresets(6);

  const handlePresetClick = (preset: FrequentPreset) => {
    // If it's a custom preset with an id, increment usage
    if (preset.id && preset.isCustom) {
      incrementPresetUsage(preset.id);
    }
    navigate(
      `/add?desc=${encodeURIComponent(preset.description)}&cat=${encodeURIComponent(preset.category)}&amt=${preset.amount}`,
    );
  };

  const handleDeletePreset = async (presetId: number) => {
    try {
      await deletePreset(presetId);
      toast.success("Preset deleted");
      setLongPressPreset(null);
    } catch {
      toast.error("Failed to delete preset");
    }
  };

  // Close long-press menu on outside click
  useEffect(() => {
    if (longPressPreset !== null) {
      const handler = () => setLongPressPreset(null);
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [longPressPreset]);

  return (
    <>
      {monthSetup === undefined ? (
        /* Loading skeletons */
        <div className="py-2.5 px-0">
          <div className="skeleton h-[220px] mb-3" />
          <div className="skeleton h-[72px] mb-3" />
          <div className="skeleton h-[300px]" />
        </div>
      ) : (
        <>
          <DashboardHeroCard
            balance={summary.closingBalance}
            monthSetup={monthSetup}
            monthYear={monthYear}
            daysLeft={daysLeft}
            spent={spent}
            budget={budget}
            remaining={remaining}
            spentPct={spentPct}
            overBudget={overBudget}
            dailyRemaining={dailyRemaining}
            onTopUp={handleTopUp}
            onSetup={() => setShowMonthInit(true)}
            monthComparison={monthComparison}
            displayName={profile?.displayName}
          />


          {/* Feature 1: Total spent card when no MonthSetup */}
          {!monthSetup && spent > 0 && (
            <div className="glass-card fade-in-up delay-1 p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs text-(--text-muted) font-medium">
                  Total spent this month (no budget set)
                </span>
              </div>
              <div className="amount-display text-[1.75rem] text-(--text) mb-3">
                {formatINR(spent)}
              </div>
              <button
                onClick={() => setShowMonthInit(true)}
                className="btn-ghost text-xs text-(--accent) font-semibold p-0 gap-1"
                id="btn-setup-cta"
              >
                Set up this month <ChevronRight size={14} />
              </button>
            </div>
          )}

          <SavingsQuickCard
            savingsBalance={savingsAcc?.currentBalance ?? 0}
            onClick={() => navigate("/savings")}
          />

          {/* Data Portability Section */}
          {!isImportDismissed && (
            <div className="fade-in-up delay-1 mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-(--text-muted) shrink-0" />
                  <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                    Data & Portability
                  </h2>
                </div>
                <button
                  onClick={handleDismissImportCard}
                  className="btn-ghost p-1 min-h-0 h-auto flex items-center justify-center rounded-full text-(--text-muted) hover:text-(--text) cursor-pointer"
                  title="Hide permanently"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="glass-card p-4 flex flex-col gap-3">
                <p className="font-sans text-xs text-(--text-muted) m-0 leading-relaxed">
                  Your data is stored locally. Import an existing CSV backup file to load your ledger.
                </p>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="btn-secondary w-full text-xs py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={13} />
                  Import CSV
                </button>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div id="quick-presets" className="fade-in-up delay-1 mb-5 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                Quick Presets
              </h2>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 w-full touch-pan-x">
              {presets.map((preset, idx) => (
                <div key={idx} className="relative shrink-0">
                  <button
                    onClick={() => handlePresetClick(preset)}
                    onContextMenu={(e) => {
                      if (preset.isCustom && preset.id) {
                        e.preventDefault();
                        setLongPressPreset(preset.id);
                      }
                    }}
                    className="shrink-0 py-3 px-4 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 transition-all duration-200 ease-out shadow-sm active:translate-y-0 active:scale-[0.98] flex flex-col items-start gap-1 min-w-[110px] cursor-pointer text-left outline-none"
                  >
                    <div className="flex items-center gap-1 w-full">
                      <span className="text-xs font-semibold text-(--text) truncate flex-1">
                        {preset.description}
                      </span>
                      {!preset.isCustom && (
                        <Zap size={9} className="text-(--text-muted) opacity-50 shrink-0" />
                      )}
                    </div>
                    <span className="text-[0.8125rem] font-bold text-(--accent)">
                      {formatINR(preset.amount)}
                    </span>
                  </button>
                  {/* Long-press context menu */}
                  {longPressPreset === preset.id && preset.isCustom && (
                    <div
                      className="absolute top-full left-0 mt-1 z-50 bg-(--bg-glass-strong) border border-(--border) rounded-(--r-md) shadow-lg py-1 min-w-[120px] animate-slide-down"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full text-left px-3 py-2 text-xs text-(--debit) font-medium flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => handleDeletePreset(preset.id!)}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {/* Create Preset Chip */}
              <button
                onClick={() => setIsCreatePresetOpen(true)}
                className="shrink-0 py-3 px-4 rounded-xl border border-dashed border-(--border) bg-transparent transition-all duration-200 ease-out active:scale-[0.98] flex items-center gap-1.5 min-w-[90px] cursor-pointer text-left outline-none"
                id="btn-create-preset"
              >
                <Plus size={14} className="text-(--accent)" />
                <span className="text-xs font-semibold text-(--accent)">Create</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="fade-in-up delay-2 mt-8">
            <div className="flex justify-between items-center mb-3.5">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                  Recent Transactions
                </h2>
              </div>
              <button
                className="btn-ghost text-[0.8125rem] py-1 px-2 gap-0.5"
                onClick={() =>
                  navigate(`/monthly/transactions?month=${monthYear}`)
                }
                id="btn-view-all"
              >
                See all <ChevronRight size={14} />
              </button>
            </div>

            {recentTxs.length === 0 ? (
              <div className="glass-card empty-state">
                <Wallet size={32} className="empty-state-icon" />
                <p className="empty-state-title">No transactions logged yet</p>
                <p className="empty-state-desc">
                  Tap <strong>+</strong> in the header to log your first entry.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentTxs.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    showAccount={true}
                  />
                ))}
              </div>
            )}
          </div>

          <TransferSheet
            isOpen={showTransfer}
            onClose={() => setShowTransfer(false)}
            savingsBalance={savingsAcc?.currentBalance ?? 0}
            defaultDirection={transferConfig.direction}
            defaultAmount={transferConfig.amount}
            defaultNote={transferConfig.note}
          />

          <MonthInitModal
            isOpen={showMonthInit}
            monthYear={monthYear}
            onClose={() => setShowMonthInit(false)}
            onSaved={() => {
              setShowMonthInit(false);
            }}
          />

          <ImportModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onSuccess={() => {
              localStorage.setItem("flo_import_dismissed", "true");
              setIsImportDismissed(true);
            }}
            activeTab="all"
          />

          <CreatePresetSheet
            isOpen={isCreatePresetOpen}
            onClose={() => setIsCreatePresetOpen(false)}
          />
        </>
      )}
    </>
  );
}
