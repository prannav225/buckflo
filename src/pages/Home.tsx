import { ChevronRight, Wallet } from "lucide-react";
import { TransactionCard } from "../components/transactions/TransactionRow";
import { TransferSheet } from "../components/transactions/TransferSheet";
import { MonthInitModal } from "../components/MonthInitModal";
import {
  DashboardHeroCard,
  SavingsQuickCard,
} from "../components/DashboardCards";
import { formatINR } from "../utils/currency";
import { useHomeData } from "../hooks/useHomeData";

export function Home() {
  const {
    navigate,
    showTransfer,
    setShowTransfer,
    transferConfig,
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
  } = useHomeData();

  return (
    <>
      {monthSetup === undefined ? (
        /* Loading skeletons */
        <div className="py-2.5">
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
          />

          <SavingsQuickCard
            savingsBalance={savingsAcc?.currentBalance ?? 0}
            onClick={() => navigate("/savings")}
          />

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="mb-5 mt-6 fade-in-up delay-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0">
                  Quick Presets
                </h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 w-full [webkit-overflow-scrolling:touch]">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    className="chip shrink-0 p-[10px_14px] rounded-(--r-md) bg-(--bg-glass-strong) border border-black/8 dark:border-white/6 shadow-(--glass-shadow) flex flex-col items-start gap-0.5 min-w-[105px] cursor-pointer text-left"
                  >
                    <span className="text-[0.8125rem] font-semibold text-(--text) whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      {preset.description}
                    </span>
                    <span className="text-[0.75rem] text-(--accent) font-semibold">
                      {formatINR(preset.amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="mt-8 fade-in-up delay-2">
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
            isOpen={monthSetup === null}
            monthYear={monthYear}
            onSaved={() => {}}
          />
        </>
      )}
    </>
  );
}
