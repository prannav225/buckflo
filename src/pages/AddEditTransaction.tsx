import { useEffect, useRef } from 'react';
import { Check, Trash2, ArrowDownLeft, ArrowUpRight, CreditCard, PiggyBank } from 'lucide-react';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { formatINR } from '../utils/currency';
import { CustomDatePicker } from '../components/CustomDatePicker';

const CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping',
  'Healthcare', 'Entertainment', 'Rent', 'Transfer', 'Other',
];

export function AddEditTransaction() {
  const {
    date, setDate,
    description, setDescription,
    amount, setAmount,
    type, setType,
    accountId, setAccountId,
    category, setCategory,
    loading, fetching, isEdit,
    expendAcc, savingsAcc,
    handleSubmit, handleDelete,
  } = useTransactionForm();

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus amount on mount for add mode (after data load)
  useEffect(() => {
    if (!fetching && !isEdit) {
      const t = setTimeout(() => amountInputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [fetching, isEdit]);

  if (fetching) {
    return (
      <div style={{ minHeight: '80dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  const parsedAmt = parseFloat(amount) || 0;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">{isEdit ? 'Edit Entry' : 'Add Entry'}</h2>
        {isEdit && (
          <button
            type="button"
            className="btn-ghost"
            onClick={handleDelete}
            style={{ color: 'var(--debit)', display: 'flex', alignItems: 'center', gap: 6 }}
            id="delete-entry-btn"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Transaction Type Toggle */}
        <div className="seg-control fade-in-up" style={{ marginBottom: 4 }}>
          <button type="button" className={`seg-option${type === 'debit' ? ' seg-debit' : ''}`} onClick={() => setType('debit')} id="page-type-debit">
            <ArrowDownLeft size={16} strokeWidth={2.5} /> Expense
          </button>
          <button type="button" className={`seg-option${type === 'credit' ? ' seg-credit' : ''}`} onClick={() => setType('credit')} id="page-type-credit">
            <ArrowUpRight size={16} strokeWidth={2.5} /> Income
          </button>
        </div>

        {/* Amount Hero Card — tappable display */}
        <div
          className={`hero-card ${type === 'debit' ? 'hero-card-orange' : 'hero-card-green'} fade-in-up delay-1`}
          style={{ cursor: 'text' }}
          onClick={() => amountInputRef.current?.focus()}
        >
          <div className="hero-card-orb-lg" />
          <div className="hero-card-orb-sm" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Amount
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: 'rgba(255,255,255,0.50)', letterSpacing: '0.04em' }}>
              Tap to edit
            </span>
          </div>

          <div className="amount-display" style={{ display: 'flex', alignItems: 'baseline', color: '#fff', position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: 'clamp(1.75rem, 8vw, 2.25rem)', marginRight: 6, fontWeight: 500, opacity: 0.85 }}>₹</span>
            <input
              id="page-tx-amount"
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'clamp(2.25rem, 10vw, 3rem)',
                color: parsedAmt > 0 ? '#fff' : 'rgba(255,255,255,0.40)',
                fontWeight: 400,
                width: '100%',
                fontFamily: "'Instrument Serif', Georgia, serif",
                padding: 0,
                margin: 0,
                boxShadow: 'none',
                lineHeight: 1,
              }}
            />
          </div>
        </div>

        {/* Details Card */}
        <div className="glass-card fade-in-up delay-2" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Description */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label" htmlFor="page-tx-desc">Description</label>
            <input
              id="page-tx-desc"
              type="text"
              placeholder="What was this transaction for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Account */}
          <div className="form-group" style={{ margin: 0 }}>
            <span className="label">Account</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {expendAcc && (
                <button
                  type="button"
                  className={`chip${accountId === expendAcc.id ? ' chip-active' : ''}`}
                  onClick={() => setAccountId(expendAcc.id!)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  id="page-acc-expenditure"
                >
                  <CreditCard size={16} /> <span>Expenditure</span>
                </button>
              )}
              {savingsAcc && (
                <button
                  type="button"
                  className={`chip${accountId === savingsAcc.id ? ' chip-active' : ''}`}
                  onClick={() => setAccountId(savingsAcc.id!)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  id="page-acc-savings"
                >
                  <PiggyBank size={16} /> <span>Savings</span>
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="form-group" style={{ margin: 0 }}>
            <span className="label">Category <span style={{ fontWeight: 400, opacity: 0.6 }}>— optional</span></span>
            <div className="chip-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%', WebkitOverflowScrolling: 'touch' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`chip${category === c ? ' chip-active' : ''}`}
                  onClick={() => setCategory(category === c ? '' : c)}
                  id={`page-cat-${c.toLowerCase()}`}
                  style={{ whiteSpace: 'nowrap', padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="label" htmlFor="page-tx-date">Date</label>
            <CustomDatePicker
              id="page-tx-date"
              value={date}
              onChange={setDate}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="fade-in-up delay-3" style={{ marginTop: 4 }}>
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%', padding: '14px 28px', borderRadius: 'var(--r-pill)',
              background: type === 'debit' ? 'var(--debit)' : 'var(--credit)',
              boxShadow: type === 'debit' ? '0 6px 20px rgba(224,85,69,0.25)' : '0 6px 20px rgba(90,158,111,0.25)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.15s',
            }}
            disabled={loading || !amount || !description}
            id="page-submit-transaction"
          >
            {loading ? 'Saving…' : (
              <>
                <Check size={18} strokeWidth={2.5} />
                {isEdit ? 'Save Changes' : `Save ${type === 'debit' ? 'Expense' : 'Income'}`}
                {parsedAmt > 0 && <span style={{ opacity: 0.85, fontWeight: 400 }}>· {formatINR(parsedAmt)}</span>}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
