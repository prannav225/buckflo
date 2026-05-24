import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, PiggyBank, ArrowRight, ChevronRight, ChevronDown, X } from 'lucide-react';
import { updateSheetOpenState } from '../utils/modalHelper';
import { db, recordTransfer, adjustBalance } from '../db/database';
import { todayISO, formatMonthYear } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/categories';
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
  const [catBudgets,      setCatBudgets]      = useState<Record<string, string>>({});
  const [showCatBudgets,  setShowCatBudgets]  = useState(false);

  // Categories excluding 'Transfer' and 'Other' (not meaningful budget targets)
  const budgetableCategories = CATEGORIES.filter(c => c !== 'Transfer' && c !== 'Other');

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
          if (setup.categoryBudgets && Object.keys(setup.categoryBudgets).length > 0) {
            const loaded: Record<string, string> = {};
            for (const [cat, amt] of Object.entries(setup.categoryBudgets)) {
              loaded[cat] = amt.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            }
            setCatBudgets(loaded);
            setShowCatBudgets(true);
          }
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

  // Handle active overlay body class for inactive background visual dimming
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

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
        // Build categoryBudgets map from non-zero entries
        const categoryBudgets: Record<string, number> = {};
        for (const [cat, val] of Object.entries(catBudgets)) {
          const n = parseFloat(val.replace(/,/g, ''));
          if (n > 0) categoryBudgets[cat] = n;
        }
        await db.monthSetups.update(existingSetup.id, { openingBalance: expBal, monthlyBudget: monthBudget, categoryBudgets });
        if (diff !== 0) await adjustBalance(expendAcc.id, diff);

        toast.success('Budget setup updated ✓');
      } else {
        await db.accounts.update(expendAcc.id, { currentBalance: expBal });
        if (!isNaN(savBal) && savBal >= 0) {
          const diff = savBal - savingsAcc.currentBalance;
          if (diff !== 0) {
            await db.transactions.add({
              date: todayISO(),
              description: 'Savings balance adjustment',
              amount: Math.abs(diff),
              type: diff > 0 ? 'credit' : 'debit',
              accountId: savingsAcc.id,
              category: 'adjustment',
              createdAt: Date.now(),
            });
          }
          await db.accounts.update(savingsAcc.id, { currentBalance: savBal });
        }

        // Build categoryBudgets map from non-zero entries
        const categoryBudgets: Record<string, number> = {};
        for (const [cat, val] of Object.entries(catBudgets)) {
          const n = parseFloat(val.replace(/,/g, ''));
          if (n > 0) categoryBudgets[cat] = n;
        }
        await db.monthSetups.add({
          monthYear,
          openingBalance: expBal,
          monthlyBudget: monthBudget,
          accountId: expendAcc.id,
          categoryBudgets,
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

          {/* ── Category Budgets ──────────────────────────── */}
          <div className="divider" style={{ margin: '18px 0' }} />
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: showCatBudgets ? 14 : 0, userSelect: 'none' }}
            onClick={() => setShowCatBudgets(v => !v)}
            role="button" tabIndex={0}
            onKeyDown={e => e.key === ' ' && setShowCatBudgets(v => !v)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(217,119,87,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={15} color="var(--accent)" />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
                Category Budgets <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.8125rem' }}>— optional</span>
              </span>
            </div>
            <ChevronDown
              size={18}
              color="var(--text-muted)"
              style={{ transition: 'transform 0.2s ease', transform: showCatBudgets ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>

          {showCatBudgets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
              {budgetableCategories.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', minWidth: 90, flexShrink: 0 }}>{cat}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-glass-strong)', borderRadius: 'var(--r-md)', padding: '0 10px', border: 'var(--glass-border)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>₹</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={catBudgets[cat] || ''}
                      onChange={e => setCatBudgets(prev => ({ ...prev, [cat]: e.target.value }))}
                      onBlur={() => {
                        const val = catBudgets[cat];
                        if (val) handleBlur(val, (v) => setCatBudgets(prev => ({ ...prev, [cat]: v })));
                      }}
                      style={{
                        border: 'none', background: 'transparent', outline: 'none',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500,
                        color: 'var(--text)', padding: '8px 0', width: '100%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

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
  return createPortal(
    <MonthInitContent
      key={`${monthYear}-${isEdit}`}
      onClose={onClose}
      monthYear={monthYear}
      onSaved={onSaved}
      isEdit={isEdit}
    />,
    document.body
  );
}
