import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Wallet } from "lucide-react";
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
import { useFrequentPresets } from "../hooks/useAnalytics";

export function Dashboard() {
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMonthInit, setShowMonthInit] = useState(false);
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

  const daysLeft = getDaysRemainingInMonth();
  const budget = monthSetup?.monthlyBudget ?? 0;
  const spent = summary.totalDebited;
  const remaining = budget - spent;
  const spentPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget && budget > 0;
  const dailyRemaining = daysLeft > 0 ? Math.max(0, remaining) / daysLeft : 0;

  // Analytics hooks
  const presets = useFrequentPresets(4);

  const handlePresetClick = (preset: (typeof presets)[number]) => {
    navigate(
      `/add?desc=${encodeURIComponent(preset.description)}&cat=${encodeURIComponent(preset.category)}&amt=${preset.amount}`,
    );
  };

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
          />

          <SavingsQuickCard
            savingsBalance={savingsAcc?.currentBalance ?? 0}
            onClick={() => navigate("/savings")}
          />

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div id="quick-presets" className="fade-in-up delay-1 mb-5 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                  Quick Presets
                </h2>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 w-full touch-pan-x">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    className="shrink-0 py-3 px-4 rounded-xl bg-(--bg-glass-strong) border border-white/8 dark:border-black/8 transition-all duration-200 ease-out shadow-sm active:translate-y-0 active:scale-[0.98] flex flex-col items-start gap-1 min-w-[110px] cursor-pointer text-left outline-none"
                  >
                    <span className="text-xs font-semibold text-(--text) truncate w-full">
                      {preset.description}
                    </span>
                    <span className="text-[0.8125rem] font-bold text-(--accent)">
                      {formatINR(preset.amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
            onSaved={() => { setShowMonthInit(false); }} />
        </>
      )}
    </>
  );
}
