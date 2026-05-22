import { useState } from 'react';
import { PiggyBank, Download } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAccount, useTransactions, useRunningBalances, useMonthSummary } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { MonthPicker } from '../components/MonthPicker';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear, formatMonthYear } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';

export function SavingsView() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());

  const savingsAcc  = useAccount('savings');
  const transactions = useTransactions(savingsAcc?.id, monthYear);

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

  // Reconstruct opening balance of the selected month by walking back from the current live balance
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

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-savings-${monthYear}.csv`);
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">Savings</h2>
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

      {/* ── Balance Hero ──────────────────────────────────────────────────── */}
      <div className="hero-card hero-card-green fade-in-up" style={{ marginBottom: 12 }}>
        {/* Decorative glass orbs */}
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
            Savings Balance
          </span>
        </div>

        <div
          className="amount-display"
          style={{ fontSize: 'clamp(2.25rem, 10vw, 3rem)', color: '#fff' }}
        >
          {formatINR(savingsAcc?.currentBalance ?? 0)}
        </div>
      </div>

      {/* ── Month Picker ─────────────────────────────────────────────────── */}
      <div className="glass-card fade-in-up delay-1" style={{ padding: '14px 18px', marginBottom: 12 }}>
        <MonthPicker monthYear={monthYear} onChange={setMonthYear} isSavings={true} />
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div className="summary-grid fade-in-up delay-2" style={{ marginBottom: 12 }}>
        <div className="summary-card">
          <div className="label">Transferred Out</div>
          <div className="amount-display amount-debit" style={{ fontSize: '1.125rem', marginTop: 4 }}>
            {formatINR(summary.totalDebited)}
          </div>
        </div>
        <div className="summary-card">
          <div className="label">Credited In</div>
          <div className="amount-display amount-credit" style={{ fontSize: '1.125rem', marginTop: 4 }}>
            {formatINR(summary.totalCredited)}
          </div>
        </div>
      </div>

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className="fade-in-up delay-3">
        <h3 className="text-[13px] font-semibold tracking-[0.04em] uppercase text-(--text-muted) mb-[10px] pl-1">
          Savings Transactions
        </h3>
        {transactions.length === 0 ? (
          <div className="glass-card empty-state mt-3">
            <PiggyBank size={32} className="empty-state-icon" />
            <p className="empty-state-title">No savings activity</p>
            <p className="empty-state-desc">
              No savings activity for {formatMonthYear(monthYear)}.
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
    </>
  );
}
