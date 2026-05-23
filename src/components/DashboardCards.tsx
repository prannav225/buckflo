import { Calendar, PiggyBank, TrendingDown, ChevronRight } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatMonthYear } from '../utils/dateUtils';
import type { MonthSetup } from '../db/database';

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
  balance, monthSetup, monthYear, daysLeft,
  spent, budget, remaining, spentPct, overBudget, dailyRemaining,
  onTopUp,
}: DashboardHeroCardProps) {
  return (
    <div className={`hero-card ${overBudget ? 'hero-card-red' : 'hero-card-orange'} fade-in-up`} style={{ marginBottom: 12 }}>
      <div className="hero-card-orb-lg" />
      <div className="hero-card-orb-sm" />

      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Expenditure Balance
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.60)' }}>
          {formatMonthYear(monthYear)}
        </span>
      </div>

      {/* Balance amount */}
      <div className="amount-display" style={{ fontSize: 'clamp(2.25rem, 10vw, 3rem)', color: '#fff', marginBottom: 20 }}>
        {formatINR(balance)}
      </div>

      {/* Budget progress */}
      {monthSetup && budget > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
            <span>{formatINR(spent)} spent of {formatINR(budget)}</span>
            {overBudget
              ? <span style={{ color: '#ffc2c2', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                  <TrendingDown size={12} /> Budget exceeded
                </span>
              : <span>{formatINR(remaining)} left</span>
            }
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.22)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${spentPct}%`, background: overBudget ? '#ff8a8a' : 'rgba(255,255,255,0.88)', borderRadius: 999, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            {overBudget 
              ? <span style={{ color: '#ffc2c2' }}>Consider topping up from Savings.</span>
              : <>Daily budget left: <span style={{ fontWeight: 700 }}>{formatINR(dailyRemaining)}/day</span></>
            }
          </div>
        </div>
      )}

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: 'rgba(255,255,255,0.62)' }}>
          <Calendar size={13} />
          <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</span>
        </div>
        <button
          onClick={onTopUp}
          id="btn-load-savings"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: overBudget ? '#fff' : 'rgba(255,255,255,0.18)',
            WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
            border: overBudget ? 'none' : '1px solid rgba(255,255,255,0.32)', borderRadius: 999,
            color: overBudget ? '#b82d23' : '#fff', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem',
            fontWeight: 600, padding: '9px 18px', cursor: 'pointer',
            transition: 'background 0.15s, transform 0.12s', letterSpacing: '-0.01em',
            boxShadow: overBudget ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
          }}
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

export function SavingsQuickCard({ savingsBalance, onClick }: SavingsQuickCardProps) {
  return (
    <div
      className="glass-card fade-in-up delay-1"
      style={{ padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      id="btn-savings-card"
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(90,158,111,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PiggyBank size={18} color="var(--credit)" />
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 1 }}>
            Savings Account
          </div>
          <div className="amount-display" style={{ fontSize: '1.3125rem', color: 'var(--credit)', letterSpacing: '-0.02em' }}>
            {formatINR(savingsBalance)}
          </div>
        </div>
      </div>
      <ChevronRight size={18} color="var(--text-muted)" />
    </div>
  );
}
