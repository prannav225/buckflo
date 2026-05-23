import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useAccount, useMonthSetup, useTransactions, useRunningBalances, useMonthSummary } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { MonthPicker } from '../components/MonthPicker';
import { MonthInitModal } from '../components/MonthInitModal';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear, formatMonthYear } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';

export function MonthlyView() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const expendAcc   = useAccount('expenditure');
  const monthSetup  = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);
  const runningBalances = useRunningBalances(transactions, monthSetup?.openingBalance ?? 0);
  const summary = useMonthSummary(transactions, monthSetup?.openingBalance ?? 0);

  const [showInitModal, setShowInitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-${monthYear}.csv`);
  };

  // Spend breakdown by category (for debits only)
  const categorySpend: { [key: string]: number } = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'debit') {
      const cat = tx.category || 'Other';
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const sortedCategories = Object.entries(categorySpend)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">Monthly</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
          id="export-csv"
          title="Export as CSV"
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      {/* ── Month Picker ─────────────────────────────────────────────────── */}
      <div className="glass-card fade-in-up" style={{ padding: '14px 18px', marginBottom: 12 }}>
        <MonthPicker monthYear={monthYear} onChange={setMonthYear} />
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup ? (
        <>
          {/* Consolidated 2x2 Summary Card */}
          <div className="glass-card fade-in-up delay-1" style={{ marginBottom: 12, overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px 8px',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Summary
              </span>
              <button
                className="btn-ghost"
                onClick={() => setShowEditModal(true)}
                style={{ fontSize: '0.75rem', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}
                id="btn-edit-setup"
              >
                Edit Setup
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '14px 18px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Opening Balance</div>
                <div className="amount-display" style={{ fontSize: '1.25rem' }}>
                  {formatINR(monthSetup.openingBalance)}
                </div>
              </div>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Monthly Budget</div>
                <div className="amount-display" style={{ fontSize: '1.25rem' }}>
                  {formatINR(monthSetup.monthlyBudget)}
                </div>
              </div>
              <div style={{ padding: '14px 18px', borderRight: '1px solid var(--border)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Total Debited</div>
                <div className="amount-display amount-debit" style={{ fontSize: '1.25rem' }}>
                  {formatINR(summary.totalDebited)}
                </div>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div className="label" style={{ marginBottom: 2 }}>Total Credited</div>
                <div className="amount-display amount-credit" style={{ fontSize: '1.25rem' }}>
                  {formatINR(summary.totalCredited)}
                </div>
              </div>
            </div>
          </div>

          {/* Closing / Running balance */}
          <div className="glass-card fade-in-up delay-2"
            style={{ padding: '16px 20px', marginBottom: 12, textAlign: 'center' }}
          >
            <div className="label" style={{ textAlign: 'center', marginBottom: 4 }}>
              {isCurrentMonth ? 'Running Balance' : 'Closing Balance'}
            </div>
            <div
              className="amount-display"
              style={{
                fontSize: '2rem',
                color: summary.closingBalance < 0 ? 'var(--debit)' : 'var(--text)',
              }}
            >
              {formatINR(summary.closingBalance)}
            </div>
          </div>

          {/* Category-wise Spend Chart */}
          {sortedCategories.length > 0 && (
            <div className="glass-card fade-in-up delay-2" style={{ padding: '18px 20px', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Category Spend
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedCategories.map(({ name, amount }) => {
                  const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                  return (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 500 }}>
                        <span style={{ color: 'var(--text)' }}>{name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatINR(amount)} <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: 2 }}>({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, var(--accent) 0%, #eb9d85 100%)',
                          borderRadius: 999,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card fade-in-up delay-1" style={{ marginBottom: 12, textAlign: 'center', padding: '28px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 14px 0', fontSize: '0.875rem' }}>
            No budget or opening balance setup found for {formatMonthYear(monthYear)}.
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowInitModal(true)}
            style={{ fontSize: '0.8125rem', padding: '10px 20px' }}
            id="btn-init-month"
          >
            Configure {formatMonthYear(monthYear).split(' ')[0]} Setup
          </button>
        </div>
      )}

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className="fade-in-up delay-3">
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          paddingLeft: '4px',
          marginBottom: '10px'
        }}>
          Expenditure Transactions
        </h3> 
        {transactions.length === 0 ? (
          <div className="glass-card empty-state" style={{ marginTop: 12 }}>
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No expenses yet this month</p>
            <p className="empty-state-desc">
              No transactions logged for {formatMonthYear(monthYear)}. Start tracking!
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 8 }}>
            {transactions.map((tx, i) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                runningBalance={runningBalances[i]}
                showRunningBalance={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Setup / Edit Modals ──────────────────────────────────────────── */}
      <MonthInitModal
        isOpen={showInitModal}
        onClose={() => setShowInitModal(false)}
        monthYear={monthYear}
        isEdit={false}
        onSaved={() => {}}
      />
      <MonthInitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        monthYear={monthYear}
        isEdit={true}
        onSaved={() => {}}
      />
    </>
  );
}
