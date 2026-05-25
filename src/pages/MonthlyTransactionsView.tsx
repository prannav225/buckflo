import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Search, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useAccount, useMonthSetup, useTransactions, useRunningBalances } from '../db/hooks';
import { TransactionCard } from '../components/transactions/TransactionRow';
import { MonthPicker } from '../components/MonthPicker';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';

export function MonthlyTransactionsView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialMonth = searchParams.get('month') || getCurrentMonthYear();
  const [monthYear, setMonthYear] = useState(initialMonth);
  const [searchQuery, setSearchQuery] = useState('');

  const initialTab = (searchParams.get('tab') as 'all' | 'expenditure' | 'savings') || 'all';
  const [activeTab, setActiveTab] = useState<'all' | 'expenditure' | 'savings'>(initialTab);
  const [pageSize, setPageSize] = useState(20);

  const expendAcc = useAccount('expenditure');
  const savingsAcc = useAccount('savings');

  // Fetch month transactions
  const expendTxs = useTransactions(expendAcc?.id, monthYear);
  const savingsTxs = useTransactions(savingsAcc?.id, monthYear);

  const monthSetupExpend = useMonthSetup(monthYear);

  // Fetch savings transactions from the 1st of the selected month to today
  // (Required to walk back and compute opening balance of Savings for that month)
  const savingsTxsSinceStart = useLiveQuery(
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

  const savingsOpeningBalance = useMemo(() => {
    if (!savingsAcc) return 0;
    let bal = savingsAcc.currentBalance;
    for (const tx of savingsTxsSinceStart) {
      bal = tx.type === 'credit' ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  }, [savingsAcc, savingsTxsSinceStart]);

  const runningBalancesExpend = useRunningBalances(expendTxs, monthSetupExpend?.openingBalance ?? 0);
  const runningBalancesSavings = useRunningBalances(savingsTxs, savingsOpeningBalance);

  const handleMonthChange = (newMonth: string) => {
    setMonthYear(newMonth);
    setSearchParams(prev => {
      prev.set('month', newMonth);
      return prev;
    }, { replace: true });
  };

  const handleTabChange = (tab: 'all' | 'expenditure' | 'savings') => {
    setActiveTab(tab);
    setPageSize(20);
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    }, { replace: true });
  };

  const handleExport = () => {
    const txsToExport =
      activeTab === 'expenditure'
        ? expendTxs
        : activeTab === 'savings'
          ? savingsTxs
          : [...expendTxs, ...savingsTxs].sort((a, b) => b.date.localeCompare(a.date));
    exportTransactionsCSV(txsToExport, `flo-${activeTab}-${monthYear}.csv`);
  };

  // Build items with original index and sort descending (newest first)
  const allItems = useMemo(() => {
    const expItems = expendTxs.map((tx, idx) => ({
      tx,
      runningBalance: runningBalancesExpend[idx],
      accountType: 'expenditure' as const
    }));

    const savItems = savingsTxs.map((tx, idx) => ({
      tx,
      runningBalance: runningBalancesSavings[idx],
      accountType: 'savings' as const
    }));

    return [...expItems, ...savItems].sort((a, b) => {
      // Primary sort: Date descending (newest first)
      if (b.tx.date !== a.tx.date) {
        return b.tx.date.localeCompare(a.tx.date);
      }
      // Secondary sort: ID descending (newest entries first)
      return (b.tx.id || 0) - (a.tx.id || 0);
    });
  }, [expendTxs, savingsTxs, runningBalancesExpend, runningBalancesSavings]);

  // Filter based on active tab
  const tabFilteredItems = useMemo(() => {
    if (activeTab === 'expenditure') {
      return allItems.filter(item => item.accountType === 'expenditure');
    }
    if (activeTab === 'savings') {
      return allItems.filter(item => item.accountType === 'savings');
    }
    return allItems;
  }, [allItems, activeTab]);

  // Filter items based on search query (matches desc, category, or amount)
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredItems;
    const q = searchQuery.toLowerCase();
    return tabFilteredItems.filter(item => {
      const descMatch = item.tx.description.toLowerCase().includes(q);
      const catMatch = item.tx.category ? item.tx.category.toLowerCase().includes(q) : false;
      const amtMatch = item.tx.amount.toString().includes(q);
      return descMatch || catMatch || amtMatch;
    });
  }, [tabFilteredItems, searchQuery]);

  const hasMoreItems = searchedItems.length > pageSize;
  const displayedItems = searchedItems.slice(0, pageSize);

  const backUrl = activeTab === 'savings' ? `/savings?month=${monthYear}` : `/monthly?month=${monthYear}`;

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn-ghost"
            onClick={() => navigate(backUrl)}
            style={{ padding: '6px', borderRadius: '50%', minHeight: 'unset', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title" style={{ margin: 0 }}>All Transactions</h2>
        </div>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={tabFilteredItems.length === 0}
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

      {/* ── Dual Account Balances ────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: 16,
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }} className="fade-in-up delay-1">
        <div>
          Expenditure Balance: <span style={{ color: 'var(--text)', fontWeight: 600, marginLeft: 2 }}>{formatINR(expendAcc?.currentBalance ?? 0)}</span>
        </div>
        <div>
          Savings Balance: <span style={{ color: 'var(--credit)', fontWeight: 600, marginLeft: 2 }}>{formatINR(savingsAcc?.currentBalance ?? 0)}</span>
        </div>
      </div>

      {/* ── Tab Switcher ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: 4,
        marginBottom: 16,
        gap: 2
      }} className="fade-in-up delay-1">
        {(['all', 'expenditure', 'savings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              flex: 1,
              border: 'none',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              borderRadius: 'calc(var(--r-lg) - 2px)',
              padding: '8px 0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      {tabFilteredItems.length > 0 && (
        <div className="glass-card fade-in-up delay-2" style={{ padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search description, category, or amount..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageSize(20);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: 'var(--text)',
              padding: '4px 0'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPageSize(20);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className="fade-in-up delay-2" style={{ marginBottom: 40 }}>
        {tabFilteredItems.length === 0 ? (
          <div className="glass-card empty-state" style={{ marginTop: 12 }}>
            <Calendar size={32} className="empty-state-icon" />
            <p className="empty-state-title">No transactions logged</p>
            <p className="empty-state-desc">
              There are no transactions logged for this month.
            </p>
          </div>
        ) : searchedItems.length === 0 ? (
          <div className="glass-card empty-state" style={{ marginTop: 12, padding: '24px 16px' }}>
            <p className="empty-state-title" style={{ fontSize: '0.9375rem' }}>No matching results</p>
            <p className="empty-state-desc" style={{ fontSize: '0.8125rem' }}>
              Try searching for something else.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 }}>
              <div style={{
                width: 3,
                height: 13,
                borderRadius: 99,
                background: activeTab === 'savings' ? 'var(--credit)' : activeTab === 'expenditure' ? 'var(--accent)' : 'var(--text-muted)',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Showing {displayedItems.length} of {searchedItems.length} Transactions
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayedItems.map(item => (
                <TransactionCard
                  key={item.tx.id}
                  transaction={item.tx}
                  runningBalance={item.runningBalance}
                  showRunningBalance={activeTab !== 'all'}
                  showAccount={activeTab === 'all'}
                />
              ))}
            </div>
            {hasMoreItems && (
              <button
                className="btn-secondary"
                onClick={() => setPageSize(prev => prev + 20)}
                style={{ width: '100%', marginTop: 16 }}
              >
                Load More
              </button>
            )}
          </>
        )}

      </div>
    </>
  );
}
