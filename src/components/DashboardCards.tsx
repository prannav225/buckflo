import { Calendar, PiggyBank, TrendingDown, ChevronRight } from "lucide-react";
import { formatINR } from "../utils/currency";
import { formatMonthYear } from "../utils/dateUtils";
import type { MonthSetup } from "../db/database";

interface DashboardHeroCardProps {
  balance: number;
  monthSetup: MonthSetup | null;
  monthYear: string;
  daysLeft: number;
  spent: number;
  budget: number;
  remaining: number;
  spentPct: number;
  overBudget: boolean;
  dailyRemaining: number;
  onTopUp: () => void;
}

export function DashboardHeroCard({
  balance,
  monthSetup,
  monthYear,
  daysLeft,
  spent,
  budget,
  remaining,
  spentPct,
  overBudget,
  dailyRemaining,
  onTopUp,
}: DashboardHeroCardProps) {
  return (
    <div
      id="balance-card"
      className={`hero-card ${
        overBudget ? "hero-card-red" : "hero-card-orange"
      } fade-in-up mb-3`}
    >
      <div className="hero-card-orb-lg" />
      <div className="hero-card-orb-sm" />

      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[0.6875rem] font-semibold text-white/65 tracking-widest uppercase">
          Expenditure Balance
        </span>
        <span className="font-sans text-xs text-white/60">
          {formatMonthYear(monthYear)}
        </span>
      </div>

      {/* Balance amount */}
      <div className="amount-display text-[clamp(2.25rem,10vw,3rem)] text-white mb-5">
        {formatINR(balance)}
      </div>

      {/* Budget progress */}
      {monthSetup && budget > 0 && (
        <div className="mb-4.5">
          <div className="flex justify-between mb-1.5 font-sans text-xs text-white/72 font-medium">
            <span>
              {formatINR(spent)} spent of {formatINR(budget)}
            </span>
            {overBudget ? (
              <span className="text-[#ffc2c2] flex items-center gap-0.75 font-semibold">
                <TrendingDown size={12} /> Budget exceeded
              </span>
            ) : (
              <span>{formatINR(remaining)} left</span>
            )}
          </div>
          <div className="h-1 bg-white/22 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                overBudget ? "bg-[#ff8a8a]" : "bg-white/88"
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="font-sans text-xs text-white/85 font-medium">
            {overBudget ? (
              <span className="text-[#ffc2c2]">
                Consider topping up from Savings.
              </span>
            ) : (
              <>
                Daily budget left:{" "}
                <span id="daily-budget-left" className="font-bold">
                  {formatINR(dailyRemaining)}/day
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.25 font-sans text-[0.8125rem] text-white/62">
          <Calendar size={13} />
          <span>
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
          </span>
        </div>
        <button
          onClick={onTopUp}
          id="btn-load-savings"
          className={`flex items-center gap-1.5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] rounded-full font-sans text-[0.8125rem] font-semibold py-2 px-4.5 cursor-pointer transition-[background,transform] active:scale-98 tracking-tight ${
            overBudget
              ? "bg-white border-none text-[#b82d23] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              : "bg-white/18 border border-white/32 text-white"
          }`}
        >
          <PiggyBank size={14} /> Top up
        </button>
      </div>
    </div>
  );
}

/* ── Savings Quick Card ────────────────────────────────────────────────────── */

interface SavingsQuickCardProps {
  savingsBalance: number;
  onClick: () => void;
}

export function SavingsQuickCard({
  savingsBalance,
  onClick,
}: SavingsQuickCardProps) {
  return (
    <div
      className="glass-card fade-in-up delay-1 p-[14px_18px] mb-3 flex items-center justify-between cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      id="btn-savings-card"
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(90,158,111,0.13)] flex items-center justify-center">
          <PiggyBank size={18} className="text-(--credit)" />
        </div>
        <div>
          <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5">
            Savings Account
          </div>
          <div className="amount-display text-[1.3125rem] text-(--credit) tracking-tight">
            {formatINR(savingsBalance)}
          </div>
        </div>
      </div>
      <ChevronRight size={18} className="text-(--text-muted)" />
    </div>
  );
}
