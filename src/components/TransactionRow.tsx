import { useNavigate } from 'react-router-dom';
import type { Transaction } from '../db/database';
import { useAccounts } from '../db/hooks';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dateUtils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  runningBalance?: number;
  showRunningBalance?: boolean;
  showAccount?: boolean;
}

export function TransactionCard({
  transaction: tx,
  runningBalance,
  showRunningBalance = false,
  showAccount = false,
}: TransactionCardProps) {
  const isDebit = tx.type === 'debit';
  const navigate = useNavigate();
  const accounts = useAccounts();
  const account = accounts.find(a => a.id === tx.accountId);

  const handleAction = () => {
    if (tx.id !== undefined) {
      navigate(`/edit/${tx.id}`);
    }
  };

  return (
    <div
      className="tx-card"
      onClick={handleAction}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      }}
    >
      {/* Icon */}
      <div className={`tx-icon ${isDebit ? 'tx-icon-debit' : 'tx-icon-credit'}`}>
        {isDebit
          ? <ArrowDownLeft size={17} color="var(--debit)"  strokeWidth={2} />
          : <ArrowUpRight  size={17} color="var(--credit)" strokeWidth={2} />
        }
      </div>

      {/* Description + meta */}
      <div className="tx-desc">
        <div className="tx-desc-title">{tx.description}</div>
        <div className="tx-desc-sub">
          <span className="tx-date">{formatDate(tx.date)}</span>
          {tx.category && (
            <span className="tx-pill tx-pill-cat">
              {tx.category}
            </span>
          )}
          {showAccount && account && (
            <span className={`tx-pill ${account.type === 'savings' ? 'tx-pill-savings' : 'tx-pill-expenditure'}`}>
              {account.type === 'savings' ? 'Savings' : 'Expenditure'}
            </span>
          )}
        </div>
      </div>

      {/* Amount + optional running balance */}
      <div className="tx-right">
        <div className={`tx-amount ${isDebit ? 'amount-debit' : 'amount-credit'}`}>
          {isDebit ? '−' : '+'}
          {formatINR(tx.amount)}
        </div>
        {showRunningBalance && runningBalance !== undefined && (
          <div className="tx-amount-sub">
            {formatINR(runningBalance)}
          </div>
        )}
      </div>
    </div>
  );
}

// Backward-compatible aliases
export { TransactionCard as TransactionListRow };
export { TransactionCard as TransactionRow };
