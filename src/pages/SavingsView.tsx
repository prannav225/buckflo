import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PiggyBank, Download, Plus, Target, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SavingGoal } from '../db/database';
import { useAccount, useTransactions, useRunningBalances, useMonthSummary } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { MonthPicker } from '../components/MonthPicker';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear, formatMonthYear } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';
import { CreateGoalSheet } from '../components/savings/CreateGoalSheet';
import { ManageGoalSheet } from '../components/savings/ManageGoalSheet';
import { SavingsGoalCard } from '../components/savings/SavingsGoalCard';
import { useSavingsGoals } from '../hooks/useSavingsGoals';

export function SavingsView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get('month') || getCurrentMonthYear();
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  const savingsAcc  = useAccount('savings');
  const transactions = useTransactions(savingsAcc?.id, monthYear);

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  // Fetch all savings transactions from the 1st of the selected month to today
  const txsSinceStart = useLiveQuery(
    async () => {
      if (!savingsAcc?.id) return [];
      const [year, month] = monthYear.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      return db.transactions
        .where('accountId')
        .equals(savingsAcc.id)
        .filter(tx => tx.date >= startDate)
        .toArray();
    },
    [savingsAcc?.id, monthYear],
    []
  );

  // Reconstruct opening balance
  const openingBalance = (() => {
    if (!savingsAcc) return 0;
    let bal = savingsAcc.currentBalance;
    for (const tx of txsSinceStart) {
      bal = tx.type === 'credit' ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  })();

  const runningBalances = useRunningBalances(transactions, openingBalance);
  const summary = useMonthSummary(transactions, openingBalance);

  const { savingGoals, totalAllocated, unallocatedBalance, currentSavingsBalance } = useSavingsGoals();

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-savings-${monthYear}.csv`);
  };

  // Staggered delay classes based on current month layout
  const summaryDelay = isCurrentMonth ? 'delay-2' : 'delay-1';
  const listDelay = isCurrentMonth ? 'delay-3' : 'delay-2';

  const LIMIT = 5;
  const hasMore = transactions.length > LIMIT;
  const displayedTransactions = hasMore ? transactions.slice(-LIMIT).reverse() : [...transactions].reverse();
  const getOriginalIndex = (index: number) => {
    return transactions.length - 1 - index;
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="sub-header-title" style={{ margin: 0 }}>Savings</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
          id="savings-export-csv"
          title="Export as CSV"
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} className="fade-in-up">
        <MonthPicker monthYear={monthYear} onChange={handleMonthChange} isSavings={true} compact={true} />
      </div>

      {/* ── Balance Hero ──────────────────────────────────────────────────── */}
      <div className="hero-card hero-card-green fade-in-up" style={{ marginBottom: 12 }}>
        <div className="hero-card-orb-lg" />
        <div className="hero-card-orb-sm" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <PiggyBank size={14} color="rgba(255,255,255,0.65)" />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {isCurrentMonth ? 'Savings Balance' : 'Savings Closing Balance'}
          </span>
        </div>

        <div
          className="amount-display"
          style={{ fontSize: 'clamp(2.25rem, 10vw, 3rem)', color: '#fff' }}
        >
          {formatINR(isCurrentMonth ? currentSavingsBalance : summary.closingBalance)}
        </div>
      </div>

      {/* ── Savings Goal Jars ────────────────────────────────────────────── */}
      {isCurrentMonth && (
        <div className="fade-in-up delay-1" style={{ marginBottom: 20, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                Goal Jars
              </h3>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 'var(--r-sm)'
              }}
              className="btn-ghost"
            >
              <Plus size={14} /> Add Jar
            </button>
          </div>

          {/* Unallocated balance card */}
          <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>
                Unallocated Savings
              </div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
                {formatINR(unallocatedBalance)}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              <div>Total Allocated</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{formatINR(totalAllocated)}</div>
            </div>
          </div>

          {/* Goal Grid */}
          {savingGoals.length === 0 ? (
            <div className="glass-card empty-state" style={{ padding: '24px 16px', minHeight: 'auto' }}>
              <Target size={28} className="empty-state-icon" style={{ opacity: 0.6 }} />
              <p className="empty-state-title" style={{ fontSize: '0.875rem' }}>No goal jars yet</p>
              <p className="empty-state-desc" style={{ fontSize: '0.75rem', maxWidth: '240px', margin: '4px auto 0' }}>
                Partition your savings into visual jars to track specific targets.
              </p>
            </div>
          ) : (
            <div className="goal-grid">
              {savingGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => setSelectedGoal(goal)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div className={`fade-in-up ${summaryDelay}`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: 14,
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          Transferred Out: <span className="amount-debit" style={{ fontWeight: 600, marginLeft: 2 }}>{formatINR(summary.totalDebited)}</span>
        </div>
        <div>
          Credited In: <span className="amount-credit" style={{ fontWeight: 600, marginLeft: 2 }}>{formatINR(summary.totalCredited)}</span>
        </div>
      </div>

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className={`fade-in-up ${listDelay}`} style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Savings Transactions
            </h3>
          </div>
          {transactions.length > 0 && (
            <button
              className="btn-ghost"
              onClick={() => navigate(`/monthly/transactions?month=${monthYear}&tab=savings`)}
              style={{ fontSize: '0.8125rem', padding: '4px 8px', gap: 2, display: 'flex', alignItems: 'center' }}
              id="btn-view-all-savings"
            >
              See all ({transactions.length}) <ChevronRight size={14} />
            </button>
          )}
        </div>
        {transactions.length === 0 ? (
          <div className="glass-card empty-state">
            <PiggyBank size={32} className="empty-state-icon" />
            <p className="empty-state-title">No savings activity</p>
            <p className="empty-state-desc">
              No savings activity for {formatMonthYear(monthYear)}.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayedTransactions.map((tx, i) => {
              const originalIndex = getOriginalIndex(i);
              return (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  runningBalance={runningBalances[originalIndex]}
                  showRunningBalance={true}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sheets / Overlays */}
      <CreateGoalSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        unallocatedBalance={unallocatedBalance}
      />

      <ManageGoalSheet
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        unallocatedBalance={unallocatedBalance}
      />
    </>
  );
}
