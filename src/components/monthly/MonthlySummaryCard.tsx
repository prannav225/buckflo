import { formatINR } from "../../utils/currency";
import { formatMonthYear } from "../../utils/dateUtils";


interface Props {
  monthYear: string;
  summary: any;
  openingBalance: number;
  spent: number;
  budget: number;
  spendableLeft: number;
  spentPct: number;
  overBudget: boolean;
  setShowEditModal: (show: boolean) => void;
}

export function MonthlySummaryCard({
  monthYear,
  summary,
  openingBalance,
  spent,
  budget,
  spendableLeft,
  spentPct,
  overBudget,
  setShowEditModal,
}: Props) {
  return (
    <div className="fade-in-up delay-1 mb-4.5 relative overflow-hidden bg-white/70 dark:bg-linear-to-br dark:from-[#2e2e2c] dark:to-[#1f1f1e] text-(--text) dark:text-white border border-white/80 dark:border-white/5 rounded-(--r-2xl) p-5.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-lg [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]">
      {/* Orbs for background depth */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-orange-100/50 dark:bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-orange-200/40 dark:bg-[rgba(217,119,87,0.1)] blur-2xl pointer-events-none" />
      <div className="absolute -inset-full bg-linear-to-tr from-transparent via-white/8 to-transparent rotate-45 pointer-events-none" />

      {/* Header Label Row */}
      <div className="flex justify-between items-center mb-1.5 font-sans text-[0.6875rem] font-semibold text-(--text-muted) dark:text-white/60 tracking-wider uppercase">
        <span>Spending Balance</span>
        <span>{formatMonthYear(monthYear)}</span>
      </div>

      {/* Big Balance Amount */}
      <div className="amount-display text-[clamp(2.25rem,10vw,2.75rem)] text-(--text) dark:text-white mb-5">
        {formatINR(summary.closingBalance)}
      </div>

      {/* Optional Budget Progress Bar */}
      {budget > 0 && (
        <div className="mb-5">
          {/* Small Starting Balance & Monthly Budget display */}
          <div className="flex justify-between font-sans text-[10px] text-(--text-muted) dark:text-white/50 mb-1.5 font-medium tracking-wide">
            <span>Opening: {formatINR(openingBalance)}</span>
            <span>Budget: {formatINR(budget)}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-in-out ${
                overBudget
                  ? "bg-(--debit)"
                  : spentPct >= 80
                    ? "bg-orange-500"
                    : "bg-black/80 dark:bg-white/90"
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>

          {/* Spent vs Left */}
          <div className="flex justify-between font-sans text-xs text-(--text-secondary) dark:text-white/80 font-medium">
            <span>
              <strong className="text-sm font-bold text-(--text) dark:text-white tracking-tight">
                {formatINR(spent)}
              </strong>{" "}
              spent
            </span>
            <span>
              {overBudget ? (
                <span className="text-(--debit) font-semibold">Exceeded</span>
              ) : (
                <span className="text-(--text) dark:text-white/90 font-semibold">
                  {formatINR(spendableLeft)} left
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Cash Flow Metrics (Debits & Credits) */}
      <div className="flex items-center justify-between border-t border-black/8 dark:border-white/10 pt-4 mt-1">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-[9px] font-semibold text-(--text-muted) dark:text-white/50 uppercase tracking-wider">
              Total Debited
            </span>
            <span className="text-sm font-bold text-(--debit) dark:text-[#eb9d85] font-sans">
              -{formatINR(summary.totalDebited)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-[9px] font-semibold text-(--text-muted) dark:text-white/50 uppercase tracking-wider">
              Total Credited
            </span>
            <span className="text-sm font-bold text-(--credit) dark:text-[#a7d3b5] font-sans">
              +{formatINR(summary.totalCredited)}
            </span>
          </div>
        </div>

        <button
          className="px-3 py-1 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/18 border border-black/10 dark:border-white/32 text-(--text) dark:text-white hover:bg-black/10 dark:hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
          onClick={() => setShowEditModal(true)}
          id="btn-edit-setup"
        >
          Edit Setup
        </button>
      </div>
    </div>
  );
}
