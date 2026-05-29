import { PiggyBank, TrendingDown, ChevronRight } from "lucide-react";
import { formatINR } from "../utils/currency";
import { formatMonthYear } from "../utils/dateUtils";
import type { MonthSetup } from "../db/database";
import type { MonthComparisonResult } from "../hooks/useMonthComparison";

interface DashboardHeroCardProps {
  balance: number;
  monthSetup: MonthSetup | null;
  monthYear: string;
  spent: number;
  budget: number;
  spentPct: number;
  overBudget: boolean;
  dailyRemaining: number;
  onTopUp: () => void;
  onSetup?: () => void;
  monthComparison?: MonthComparisonResult;
}

export function DashboardHeroCard({
  balance,
  monthSetup,
  monthYear,
  spent,
  budget,
  spentPct,
  overBudget,
  dailyRemaining,
  onTopUp,
  onSetup,
  monthComparison,
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
      {monthSetup && budget > 0 ? (
        <div className="mb-5">
          <div className="h-1 bg-white/22 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-in-out ${
                overBudget ? "bg-[#ff8a8a]" : "bg-white/88"
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <div className="flex justify-between items-baseline font-sans text-xs text-white/80 font-medium">
            <span>
              <span className="text-[0.9375rem] font-bold text-white tracking-tight">
                {formatINR(spent)} spent
              </span>{" "}
              of {formatINR(budget)}
            </span>
            <span>
              {overBudget ? (
                <span className="text-[#ffc2c2] flex items-center gap-0.75 font-semibold">
                  <TrendingDown size={12} /> Budget exceeded
                </span>
              ) : (
                <span className="text-white/90 font-semibold">
                  {formatINR(dailyRemaining)}/day left
                </span>
              )}
            </span>
          </div>
        </div>
      ) : !monthSetup && onSetup ? (
        <div className="mb-5 relative z-10">
          <p className="font-sans text-xs text-white/80 mb-0 leading-relaxed">
            Your month is not set up yet. Initialize it now to track your daily
            budget and opening balance.
          </p>
        </div>
      ) : null}

      {/* Footer row */}
      <div className="flex items-center justify-between min-h-[36px]">
        <div className="flex-1 min-w-0 pr-2">
          {monthComparison?.hasLastMonthData && (
            <div className="font-sans text-[11px] font-semibold select-none">
              {monthComparison.direction === "up" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[rgba(255,220,205,0.95)] border border-white/15 shadow-sm truncate max-w-full">
                  ↑ {monthComparison.percentChange}% vs last month
                </span>
              )}
              {monthComparison.direction === "down" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[rgba(200,255,200,0.95)] border border-white/15 shadow-sm truncate max-w-full">
                  ↓ {monthComparison.percentChange}% vs last month
                </span>
              )}
              {monthComparison.direction === "neutral" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10 shadow-sm truncate max-w-full">
                  ≈ On track vs last month
                </span>
              )}
            </div>
          )}
        </div>
        {!monthSetup && onSetup ? (
          <button
            onClick={onSetup}
            id="btn-prompt-setup"
            className="shrink-0 flex items-center gap-1.5 bg-white text-(--accent-dark) rounded-full font-sans text-[0.8125rem] font-bold py-2 px-4.5 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-98 transition-transform outline-none focus:outline-none"
          >
            Set Up Now
          </button>
        ) : (
          <button
            onClick={onTopUp}
            id="btn-load-savings"
            className={`shrink-0 flex items-center gap-1.5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] rounded-full font-sans text-[0.8125rem] font-semibold py-2 px-4 cursor-pointer transition-[background,transform] active:scale-98 tracking-tight ${
              overBudget
                ? "bg-white border-none text-[#b82d23] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                : "bg-white/18 border border-white/32 text-white hover:bg-white/25"
            }`}
          >
            <PiggyBank size={14} /> Transfer
          </button>
        )}
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

/* ── Setup Prompt Card ──────────────────────────────────────────────────────── */

interface SetupPromptCardProps {
  monthYear: string;
  onAction: () => void;
}

export function SetupPromptCard({ monthYear, onAction }: SetupPromptCardProps) {
  return (
    <div
      id="setup-prompt-card"
      className="hero-card hero-card-orange fade-in-up mb-3 flex flex-col justify-between min-h-[190px] relative overflow-hidden"
    >
      <div className="hero-card-orb-lg" />
      <div className="hero-card-orb-sm" />

      <div className="relative z-10">
        <span className="font-sans text-[0.6875rem] font-semibold text-white/65 tracking-widest uppercase">
          Month Initialization
        </span>
        <h2 className="font-display text-2xl text-white mt-3 mb-1.5 font-bold tracking-tight">
          Initialize {formatMonthYear(monthYear)}
        </h2>
        <p className="font-sans text-xs text-white/80 max-w-[280px] leading-relaxed">
          Set up your expenditure budget and opening account balances to begin
          tracking your cash flow.
        </p>
      </div>

      <div className="relative z-10 flex justify-end mt-4">
        <button
          onClick={onAction}
          id="btn-prompt-setup"
          className="flex items-center gap-1.5 bg-white text-(--accent-dark) rounded-full font-sans text-[0.8125rem] font-bold py-2.5 px-5 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-98 transition-transform outline-none focus:outline-none"
        >
          Set Up Now
        </button>
      </div>
    </div>
  );
}
