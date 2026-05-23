import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useAccount, useMonthSetup, useRecentTransactions, useMonthSummary, useTransactions } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { TransferSheet } from '../components/TransferSheet';
import { MonthInitModal } from '../components/MonthInitModal';
import { DashboardHeroCard, SavingsQuickCard } from '../components/DashboardCards';
import { getCurrentMonthYear, getDaysRemainingInMonth } from '../utils/dateUtils';
import { formatINR } from '../utils/currency';
import { useBurnRate, useSubscriptionAlerts, useWeekOverWeek, useFrequentPresets } from '../hooks/useAnalytics';

export function Dashboard() {
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  const monthYear = getCurrentMonthYear();

  const expendAcc   = useAccount('expenditure');
  const savingsAcc  = useAccount('savings');
  const monthSetup  = useMonthSetup(monthYear);
  const recentTxs   = useRecentTransactions(undefined, 5);
  const allMonthTxs = useTransactions(expendAcc?.id, monthYear);
  const summary     = useMonthSummary(allMonthTxs, monthSetup?.openingBalance ?? 0);

  const daysLeft       = getDaysRemainingInMonth();
  const budget         = monthSetup?.monthlyBudget ?? 0;
  const spent          = summary.totalDebited;
  const remaining      = budget - spent;
  const spentPct       = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget     = spent > budget && budget > 0;
  const dailyRemaining = daysLeft > 0 ? Math.max(0, remaining) / daysLeft : 0;

  // Analytics hooks
  const presets = useFrequentPresets(4);
  const burnRate = useBurnRate(budget, spent);
  const wow = useWeekOverWeek();
  const subscriptions = useSubscriptionAlerts();

  const handlePresetClick = (preset: typeof presets[number]) => {
    navigate(`/add?desc=${encodeURIComponent(preset.description)}&cat=${encodeURIComponent(preset.category)}&amt=${preset.amount}`);
  };

  return (
    <>
      {monthSetup === undefined ? (
        /* Loading skeletons */
        <div style={{ padding: '10px 0' }}>
          <div className="skeleton" style={{ height: 220, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 72, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 300 }} />
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
            onTopUp={() => setShowTransfer(true)}
          />

          <SavingsQuickCard
            savingsBalance={savingsAcc?.currentBalance ?? 0}
            onClick={() => navigate('/savings')}
          />

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="fade-in-up delay-1" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
                Quick Presets
              </h2>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%', WebkitOverflowScrolling: 'touch' }}>
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    className="chip"
                    style={{
                      flexShrink: 0,
                      padding: '10px 14px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--bg-glass-strong)',
                      border: 'var(--glass-border)',
                      boxShadow: 'var(--glass-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 2,
                      minWidth: 105,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                      {preset.description}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                      {formatINR(preset.amount)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Smart Insights */}
          {(burnRate.isOverrunProjected || wow.lastWeekTotal > 0) && (
            <div className="fade-in-up delay-1" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
                Smart Insights
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Burn Rate warning */}
                {burnRate.isOverrunProjected && burnRate.dayOfExhaustion !== null && (
                  <div className="insight-card insight-card-danger">
                    <div className="insight-icon-container">
                      <TrendingDown size={20} />
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Budget Exhaustion Warning</div>
                      <div className="insight-desc">
                        At your current daily spend of <span>{formatINR(burnRate.avgDailySpend)}</span>, your budget is projected to run out around day <span>{burnRate.dayOfExhaustion}</span> of this month.
                      </div>
                    </div>
                  </div>
                )}

                {/* WoW card */}
                {wow.lastWeekTotal > 0 && (
                  <div className={`insight-card ${wow.percentChange <= 0 ? 'insight-card-success' : 'insight-card-danger'}`}>
                    <div className="insight-icon-container">
                      {wow.percentChange <= 0 ? (
                        <TrendingUp size={20} style={{ transform: 'rotate(90deg)' }} />
                      ) : (
                        <TrendingUp size={20} />
                      )}
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Weekly Spending Trend</div>
                      <div className="insight-desc">
                        {wow.percentChange <= 0 ? (
                          <>
                            You've spent <span style={{ color: 'var(--credit)' }}>{Math.abs(wow.percentChange)}% less</span> this week (<span>{formatINR(wow.thisWeekTotal)}</span>) compared to last week (<span>{formatINR(wow.lastWeekTotal)}</span>).
                          </>
                        ) : (
                          <>
                            Your spending is up by <span style={{ color: 'var(--debit)' }}>{wow.percentChange}%</span> this week (<span>{formatINR(wow.thisWeekTotal)}</span>) compared to last week (<span>{formatINR(wow.lastWeekTotal)}</span>).
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {subscriptions.length > 0 && (
            <div className="fade-in-up delay-1" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingLeft: 4 }}>
                Upcoming Bills & Subscriptions
              </h2>
              <div className="glass-card" style={{ padding: '8px 12px' }}>
                {subscriptions.map((sub, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 6px',
                      borderBottom: idx < subscriptions.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: 'rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Clock size={14} color="var(--text-muted)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                          {sub.description}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>
                          Due in {sub.daysLeft} day{sub.daysLeft !== 1 ? 's' : ''} ({sub.nextDueDate})
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)' }}>
                      {formatINR(sub.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="fade-in-up delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingLeft: 4 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Recent Transactions</h2>
              <button
                className="btn-ghost"
                onClick={() => navigate('/monthly')}
                style={{ fontSize: '0.8125rem', padding: '4px 8px', gap: 2 }}
                id="btn-view-all"
              >
                See all <ChevronRight size={14} />
              </button>
            </div>

            {recentTxs.length === 0 ? (
              <div className="glass-card empty-state">
                <Wallet size={32} className="empty-state-icon" />
                <p className="empty-state-title">No transactions logged yet</p>
                <p className="empty-state-desc">Tap <strong>+</strong> in the header to log your first entry.</p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 8 }}>
                {recentTxs.map(tx => (
                  <TransactionCard key={tx.id} transaction={tx} showAccount={true} />
                ))}
              </div>
            )}
          </div>

          <TransferSheet
            isOpen={showTransfer}
            onClose={() => setShowTransfer(false)}
            savingsBalance={savingsAcc?.currentBalance ?? 0}
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
