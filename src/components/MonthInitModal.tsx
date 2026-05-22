import { useState, useEffect } from 'react';
import { Wallet, PiggyBank, ArrowRight, ChevronRight, X } from 'lucide-react';
import { db, recordTransfer, adjustBalance } from '../db/database';
import { todayISO, formatMonthYear } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface MonthInitModalProps {
  isOpen: boolean;
  onClose?: () => void;
  monthYear: string;
  onSaved: () => void;
  isEdit?: boolean;
}

// ── Inner content — mounts fresh each time isOpen flips to true ──────────────
// This eliminates the setState-in-effect pattern: state resets naturally on
// remount, and the async load runs inside useEffect without any sync setState.

interface ContentProps {
  onClose?: () => void;
  monthYear: string;
  onSaved: () => void;
  isEdit: boolean;
}

function MonthInitContent({ onClose, monthYear, onSaved, isEdit }: ContentProps) {
  const [expendBalance,   setExpendBalance]   = useState('');
  const [savingsBalance,  setSavingsBalance]  = useState('');
  const [budget,          setBudget]          = useState('');
  const [includeTransfer, setIncludeTransfer] = useState(false);
  const [transferAmount,  setTransferAmount]  = useState('');
  const [loading,         setLoading]         = useState(isEdit); // start true only in edit mode

  const handleBlur = (val: string, setter: (v: string) => void) => {
    if (!val) return;
    const num = parseFloat(val.replace(/,/g, ''));
    if (!isNaN(num)) {
      setter(num.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
    }
  };

  // In edit mode: load existing values asynchronously
  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    db.monthSetups
      .where('monthYear')
      .equals(monthYear)
      .first()
      .then((setup) => {
        if (cancelled) return;
        if (setup) {
          setExpendBalance(setup.openingBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
          setBudget(setup.monthlyBudget.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        toast.error('Failed to load budget setup');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackdrop = (e: React.MouseEvent) => {
    if (onClose && e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expBal      = parseFloat(expendBalance.replace(/,/g, ''));
    const savBal      = parseFloat(savingsBalance.replace(/,/g, ''));
    const monthBudget = parseFloat(budget.replace(/,/g, ''));

    if (isNaN(expBal))              { toast.error('Enter expenditure opening balance'); return; }
    if (!monthBudget || monthBudget <= 0) { toast.error('Enter a valid monthly budget'); return; }

    setLoading(true);
    try {
      const [expendAcc, savingsAcc] = await Promise.all([
        db.accounts.where('type').equals('expenditure').first(),
        db.accounts.where('type').equals('savings').first(),
      ]);

      if (!expendAcc?.id || !savingsAcc?.id) throw new Error('Accounts not found');

      if (isEdit) {
        const existingSetup = await db.monthSetups
          .where('[accountId+monthYear]')
          .equals([expendAcc.id, monthYear])
          .first();

        if (!existingSetup?.id) throw new Error('Setup record not found');

        const diff = expBal - existingSetup.openingBalance;
        await db.monthSetups.update(existingSetup.id, { openingBalance: expBal, monthlyBudget: monthBudget });
        if (diff !== 0) await adjustBalance(expendAcc.id, diff);

        toast.success('Budget setup updated ✓');
      } else {
        await db.accounts.update(expendAcc.id, { currentBalance: expBal });
        if (!isNaN(savBal) && savBal >= 0) {
          await db.accounts.update(savingsAcc.id, { currentBalance: savBal });
        }

        await db.monthSetups.add({
          monthYear,
          openingBalance: expBal,
          monthlyBudget: monthBudget,
          accountId: expendAcc.id,
        });

        if (includeTransfer && transferAmount) {
          const txAmt = parseFloat(transferAmount.replace(/,/g, ''));
          if (txAmt > 0) await recordTransfer(txAmt, todayISO(), 'Opening transfer from Savings', 'opening-transfer');
        }

        toast.success(`${formatMonthYear(monthYear)} is set up!`);
      }

      onSaved();
      if (onClose) onClose();
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const monthLabel = formatMonthYear(monthYear);

  return (
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${isEdit ? 'Edit' : 'Set up'} budget for ${monthLabel}`}
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
              {isEdit ? 'Edit Budget Setup' : 'New Month Setup'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              {monthLabel} — {isEdit ? 'Adjust your limits' : 'Set your opening balances'}
            </p>
          </div>
          {onClose && (
            <button className="btn-ghost" onClick={onClose} aria-label="Close" style={{ padding: '8px', borderRadius: '50%' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>

          {/* ── Expenditure ──────────────────────────────── */}
          <SectionHeader icon={<Wallet size={15} color="var(--accent)" />} bg="rgba(217,119,87,0.12)" label="Expenditure Account" />

          <div className="form-group">
            <label htmlFor="modal-expend-balance" className="label">Opening Balance (₹)</label>
            <input id="modal-expend-balance" type="text" inputMode="decimal" placeholder="e.g. 25,000"
              value={expendBalance} onChange={e => setExpendBalance(e.target.value)} onBlur={() => handleBlur(expendBalance, setExpendBalance)} className="input-field" required autoFocus={!isEdit} />
          </div>

          <div className="form-group">
            <label htmlFor="modal-monthly-budget" className="label">Monthly Budget (₹)</label>
            <input id="modal-monthly-budget" type="text" inputMode="decimal" placeholder="e.g. 30,000"
              value={budget} onChange={e => setBudget(e.target.value)} onBlur={() => handleBlur(budget, setBudget)} className="input-field" required />
          </div>

          {/* ── Savings (new setup only) ──────────────────── */}
          {!isEdit && (
            <>
              <div className="divider" style={{ margin: '20px 0' }} />

              <SectionHeader icon={<PiggyBank size={15} color="var(--credit)" />} bg="rgba(90,158,111,0.12)" label="Savings Account" />

              <div className="form-group">
                <label htmlFor="modal-savings-balance" className="label">
                  Opening Balance (₹)&nbsp;<span style={{ fontWeight: 400, opacity: 0.7 }}>— optional</span>
                </label>
                <input id="modal-savings-balance" type="text" inputMode="decimal" placeholder="e.g. 1,50,000"
                  value={savingsBalance} onChange={e => setSavingsBalance(e.target.value)} onBlur={() => handleBlur(savingsBalance, setSavingsBalance)} className="input-field" />
              </div>

              {/* Transfer toggle */}
              <div
                className={`checkbox-row${includeTransfer ? ' checked' : ''}`}
                style={{ marginBottom: includeTransfer ? 14 : 0 }}
                onClick={() => setIncludeTransfer(v => !v)}
                role="checkbox" aria-checked={includeTransfer} tabIndex={0}
                onKeyDown={e => e.key === ' ' && setIncludeTransfer(v => !v)}
                id="modal-toggle-opening-transfer"
              >
                <div className="checkbox-box">
                  {includeTransfer && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500 }}>
                  Log an opening transfer from Savings
                </span>
              </div>

              {includeTransfer && (
                <div className="form-group" style={{ padding: '14px 16px', background: 'rgba(217,119,87,0.07)', borderRadius: 'var(--r-lg)', border: '1px solid rgba(217,119,87,0.18)' }}>
                  <label htmlFor="modal-transfer-amt" className="label">Transfer Amount (₹)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PiggyBank size={15} color="var(--credit)" style={{ flexShrink: 0 }} />
                    <ArrowRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <Wallet size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <input id="modal-transfer-amt" type="text" inputMode="decimal" placeholder="0.00"
                      value={transferAmount} onChange={e => setTransferAmount(e.target.value)} onBlur={() => handleBlur(transferAmount, setTransferAmount)}
                      className="input-field" style={{ flex: 1, marginBottom: 0 }} />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={loading} id="modal-btn-start-month">
            {loading ? 'Saving…' : (
              <>{isEdit ? 'Save Changes' : `Start ${monthLabel}`}<ChevronRight size={16} strokeWidth={2.5} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Small helper for section icons/labels ────────────────────────────────────
function SectionHeader({ icon, bg, label }: { icon: React.ReactNode; bg: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
        {label}
      </span>
    </div>
  );
}

// ── Public shell — mounts inner content only when open ───────────────────────
export function MonthInitModal({ isOpen, onClose, monthYear, onSaved, isEdit = false }: MonthInitModalProps) {
  if (!isOpen) return null;
  return (
    <MonthInitContent
      key={`${monthYear}-${isEdit}`}
      onClose={onClose}
      monthYear={monthYear}
      onSaved={onSaved}
      isEdit={isEdit}
    />
  );
}
