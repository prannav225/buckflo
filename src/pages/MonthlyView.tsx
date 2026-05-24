import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useAccount, useMonthSetup, useTransactions, useRunningBalances, useMonthSummary } from '../db/hooks';
import { MonthPicker } from '../components/MonthPicker';
import { MonthInitModal } from '../components/MonthInitModal';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear, formatMonthYear } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';
import { useHistoricalData } from '../hooks/useAnalytics';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { BudgetOverviewCard } from '../components/monthly/BudgetOverviewCard';
import { RecentTransactionsList } from '../components/monthly/RecentTransactionsList';

export function MonthlyView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthYear = searchParams.get('month') || getCurrentMonthYear();
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const expendAcc   = useAccount('expenditure');
  const monthSetup  = useMonthSetup(monthYear);
  const transactions = useTransactions(expendAcc?.id, monthYear);
  const runningBalances = useRunningBalances(transactions, monthSetup?.openingBalance ?? 0);
  const summary = useMonthSummary(transactions, monthSetup?.openingBalance ?? 0);

  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const historicalData = useHistoricalData(6);

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

  const handleMonthChange = (newMonth: string) => {
    setSearchParams({ month: newMonth }, { replace: true });
  };

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="sub-header-title" style={{ margin: 0 }}>Monthly</h2>
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

      {/* ── Compact Month Filter ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} className="fade-in-up">
        <MonthPicker monthYear={monthYear} onChange={handleMonthChange} compact={true} />
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      {monthSetup ? (
        <>
          {/* Collapsible Spending Trend Chart */}
          <div
            className="glass-card fade-in-up delay-1"
            style={{ marginBottom: 12, padding: '12px 18px', cursor: 'pointer' }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setIsChartExpanded(!isChartExpanded)}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spending Trend (6 Months)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                {isChartExpanded ? 'Hide Chart' : 'Show Trend'}
              </span>
            </div>
            {isChartExpanded && historicalData.length > 0 && (
              <div style={{ height: 160, marginTop: 12, width: '100%' }} onClick={(e) => e.stopPropagation()}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(value: any) => [formatINR(value), 'Spend']}
                      contentStyle={{
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--glass-border)',
                        borderRadius: 'var(--r-md)',
                        color: 'var(--text)',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="totalDebited" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 12px 12px 12px' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--r-md)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Opening Balance</div>
                <div className="amount-display" style={{ fontSize: '1.25rem' }}>
                  {formatINR(monthSetup.openingBalance)}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--r-md)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Monthly Budget</div>
                <div className="amount-display" style={{ fontSize: '1.25rem' }}>
                  {formatINR(monthSetup.monthlyBudget)}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(224, 85, 69, 0.04)', borderRadius: 'var(--r-md)' }}>
                <div className="label" style={{ marginBottom: 2 }}>Total Debited</div>
                <div className="amount-display amount-debit" style={{ fontSize: '1.25rem' }}>
                  {formatINR(summary.totalDebited)}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(90, 158, 111, 0.04)', borderRadius: 'var(--r-md)' }}>
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
          <BudgetOverviewCard
            sortedCategories={sortedCategories}
            monthSetup={monthSetup}
            totalExpense={totalExpense}
          />
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
      <RecentTransactionsList
        transactions={transactions}
        runningBalances={runningBalances}
        monthYear={monthYear}
      />

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
