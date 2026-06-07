import { Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { formatINR } from "../../utils/currency";
import { formatMonthYear } from "../../utils/dateUtils";

interface Props {
  monthYear: string;
  totalIncome: number;
  totalFixedCosts: number;
  unpaidBills: number;
  setShowEditModal: (show: boolean) => void;
}

export function MonthPlannerDashboard({
  monthYear,
  totalIncome,
  totalFixedCosts,
  unpaidBills,
  setShowEditModal,
}: Props) {
  const isAllPaid = unpaidBills <= 0;
  const paidBills = Math.max(0, totalFixedCosts - unpaidBills);
  
  // Calculate percentages
  const paidPct = totalFixedCosts > 0 ? (paidBills / totalFixedCosts) * 100 : 0;
  
  // 50/30/20 Rule: Fixed Costs Ratio
  const fixedRatio = totalIncome > 0 ? (totalFixedCosts / totalIncome) * 100 : 0;
  let ratioColor = "text-(--credit)";
  if (fixedRatio > 50) ratioColor = "text-(--accent)"; // Warning: > 50%
  if (fixedRatio > 70) ratioColor = "text-(--debit)"; // Danger: > 70%

  // SVG Ring calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (paidPct / 100) * circumference;

  return (
    <div className="glass-card fade-in-up delay-1 mb-4 p-5 relative overflow-hidden bg-(--bg-glass-strong) border border-black/5 dark:border-white/5 shadow-sm">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-(--accent)/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="font-display text-xl font-semibold text-(--text) tracking-tight m-0 mb-0.5">
            {formatMonthYear(monthYear)} Planner
          </h2>
          <p className="font-sans text-[11px] text-(--text-muted) m-0 font-medium tracking-wide">
            Your fixed obligations & bills
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 text-(--text-secondary) hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        >
          <Edit3 size={12} />
          Setup
        </button>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        {/* Left Side: Circular Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="6"
              className="text-black/5 dark:text-white/5"
            />
            {/* Progress ring */}
            {totalFixedCosts > 0 && (
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-(--credit) transition-all duration-1000 ease-out"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isAllPaid && totalFixedCosts > 0 ? (
              <CheckCircle2 size={24} className="text-(--credit) animate-fade-in" />
            ) : (
              <>
                <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider">
                  Paid
                </span>
                <span className="text-lg font-display font-semibold text-(--text) leading-none mt-0.5">
                  {Math.round(paidPct)}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Key Metrics */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Unpaid Bills */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">
                Left To Pay
              </span>
              <Tooltip id="tt-unpaid" text="The total amount of committed expenses and subscriptions that haven't been paid yet." />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-display font-medium tracking-tight leading-none ${isAllPaid ? 'text-(--credit)' : 'text-(--text)'}`}>
                {formatINR(unpaidBills)}
              </span>
              {!isAllPaid && (
                <span className="text-xs text-(--debit) font-medium mb-0.5 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} /> Action needed
                </span>
              )}
            </div>
          </div>

          {/* Fixed Cost Ratio */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/3 dark:bg-white/4 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
              <span className="text-[9px] font-semibold text-(--text-muted) uppercase tracking-widest block mb-0.5">
                Total Bills
              </span>
              <span className="text-sm font-semibold text-(--text)">
                {formatINR(totalFixedCosts)}
              </span>
            </div>
            <div className="bg-black/3 dark:bg-white/4 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[9px] font-semibold text-(--text-muted) uppercase tracking-widest">
                  Ratio
                </span>
                <Tooltip id="tt-ratio" text="Percentage of your income taken up by fixed costs. Try to keep this under 50%." />
              </div>
              <span className={`text-sm font-semibold ${ratioColor}`}>
                {totalIncome > 0 ? `${Math.round(fixedRatio)}%` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
