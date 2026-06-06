import { TrendingDown, TrendingUp, Edit3 } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { formatINR } from "../../utils/currency";
import { formatMonthYear } from "../../utils/dateUtils";
import { startOfDay, differenceInDays, endOfMonth } from "date-fns";

interface Props {
  monthYear: string;
  budget: number;
  spent: number;
  spendableLeft: number;
  netCashFlow: number;
  fixedAllocation: number;
  setShowEditModal: (show: boolean) => void;
}

export function MonthPlannerDashboard({
  monthYear,
  budget,
  spent,
  spendableLeft,
  netCashFlow,
  fixedAllocation,
  setShowEditModal,
}: Props) {
  const overBudget = spent > budget && budget > 0;
  const isPositiveCashFlow = netCashFlow >= 0;

  // Calculate daily pacing
  const today = startOfDay(new Date());
  // If we are looking at a past or future month, we'll just show the total left.
  const [yearStr, monthStr] = monthYear.split("-");
  const monthDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
  const endOfThisMonth = endOfMonth(monthDate);
  
  let daysLeft = differenceInDays(endOfThisMonth, today);
  if (daysLeft < 0) daysLeft = 0; // Past month
  
  const dailyRemaining = daysLeft > 0 ? spendableLeft / daysLeft : spendableLeft;

  // Allocation Bar Math
  // We want to show Fixed vs Spent vs Remaining
  const totalAllocated = Math.max(budget, spent) + fixedAllocation;
  
  // Percentages for the stacked bar
  const fixedPct = totalAllocated > 0 ? (fixedAllocation / totalAllocated) * 100 : 0;
  const spentPct = totalAllocated > 0 ? (spent / totalAllocated) * 100 : 0;
  const remainingPct = totalAllocated > 0 ? (spendableLeft / totalAllocated) * 100 : 0;

  return (
    <div className="glass-card fade-in-up delay-1 mb-4 p-5 relative overflow-hidden bg-(--bg-glass-strong) border border-black/5 dark:border-white/5 shadow-sm">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-(--accent)/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="font-display text-xl font-semibold text-(--text) tracking-tight m-0 mb-0.5">
            {formatMonthYear(monthYear)} Overview
          </h2>
          <p className="font-sans text-[11px] text-(--text-muted) m-0 font-medium tracking-wide">
            Your monthly cash flow planner
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

      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        {/* Budget Left */}
        <div className="bg-black/3 dark:bg-white/4 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">
              Safe to Spend
            </div>
            <Tooltip id="tt-safe-spend" text="The amount of variable budget left for the rest of the month, after accounting for what you've already spent." />
          </div>
          <div className="text-xl font-display font-medium text-(--text) tracking-tight leading-none mb-1">
            {formatINR(spendableLeft)}
          </div>
          <div className={`text-[10px] font-semibold flex items-center gap-1 ${overBudget ? 'text-(--debit)' : 'text-(--text-secondary)'}`}>
            {overBudget ? (
              <>
                <TrendingDown size={12} /> Exceeded target
              </>
            ) : daysLeft > 0 ? (
              `${formatINR(dailyRemaining)}/day safe`
            ) : (
              "Month complete"
            )}
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-black/3 dark:bg-white/4 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-widest">
              Income vs Expenses
            </div>
            <Tooltip id="tt-net-cash" text="The difference between your total income and total expenses this month. Positive means you're saving money." />
          </div>
          <div className={`text-xl font-display font-medium tracking-tight leading-none mb-1 ${isPositiveCashFlow ? 'text-(--credit)' : 'text-(--debit)'}`}>
            {isPositiveCashFlow ? '+' : ''}{formatINR(netCashFlow)}
          </div>
          <div className="text-[10px] font-semibold text-(--text-muted) flex items-center gap-1">
            {isPositiveCashFlow ? (
              <>
                <TrendingUp size={12} /> Positive flow
              </>
            ) : (
              <>
                <TrendingDown size={12} /> Negative flow
              </>
            )}
          </div>
        </div>
      </div>

      {/* Allocation Stacked Bar */}
      <div className="relative z-10 mt-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
              Where Your Money Goes
            </span>
            <Tooltip id="tt-allocation" text="A visual breakdown of your money allocation: bills you must pay, money you've spent, and what is still safe to spend." />
          </div>
          <span className="font-sans text-[10px] font-semibold text-(--text-secondary)">
            {formatINR(totalAllocated)} Total
          </span>
        </div>
        
        {/* The Bar */}
        <div className="h-2.5 rounded-full flex overflow-hidden gap-0.5 bg-black/5 dark:bg-white/5">
          {fixedPct > 0 && (
            <div 
              className="bg-(--credit) transition-all duration-700 ease-out" 
              style={{ width: `${fixedPct}%` }}
              title={`Bills & Subs: ${formatINR(fixedAllocation)}`}
            />
          )}
          {spentPct > 0 && (
            <div 
              className={`transition-all duration-700 ease-out ${overBudget ? 'bg-(--debit)' : 'bg-(--accent)'}`} 
              style={{ width: `${spentPct}%` }}
              title={`Variable Spent: ${formatINR(spent)}`}
            />
          )}
          {remainingPct > 0 && (
            <div 
              className="bg-black/10 dark:bg-white/20 transition-all duration-700 ease-out" 
              style={{ width: `${remainingPct}%` }}
              title={`Safe to Spend: ${formatINR(spendableLeft)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-(--credit)" />
            <span className="text-[9px] font-semibold text-(--text-muted) uppercase tracking-wider">Bills & Subs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${overBudget ? 'bg-(--debit)' : 'bg-(--accent)'}`} />
            <span className="text-[9px] font-semibold text-(--text-muted) uppercase tracking-wider">Variable Spent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/30" />
            <span className="text-[9px] font-semibold text-(--text-muted) uppercase tracking-wider">Safe to Spend</span>
          </div>
        </div>
      </div>

    </div>
  );
}
