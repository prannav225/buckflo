import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wallet } from 'lucide-react';
import { useAccount, useMonthSetup, useRecentTransactions, useMonthSummary, useTransactions } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { TransferSheet } from '../components/TransferSheet';
import { MonthInitModal } from '../components/MonthInitModal';
import { DashboardHeroCard, SavingsQuickCard } from '../components/DashboardCards';
import { getCurrentMonthYear, getDaysRemainingInMonth } from '../utils/dateUtils';

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
            expendAcc={expendAcc}
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
                <p className="empty-state-title">No transactions this month yet</p>
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
