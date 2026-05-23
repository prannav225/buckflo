import { useState, useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { recordTransfer } from '../db/database';
import { todayISO } from '../utils/dateUtils';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';

interface TransferSheetProps {
  isOpen: boolean;
  onClose: () => void;
  savingsBalance: number;
}

// ── Inner content — mounts fresh on every open, eliminating setState-in-effect ─
function TransferSheetContent({ onClose, savingsBalance }: Omit<TransferSheetProps, 'isOpen'>) {
  const [amount,  setAmount]  = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount (no reset needed — fresh mount every time)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)    { toast.error('Enter a valid amount'); return; }
    if (amt > savingsBalance) { toast.error('Amount exceeds savings balance'); return; }

    setLoading(true);
    try {
      await recordTransfer(amt, todayISO(), note || 'Transfer to Expenditure', 'transfer');
      toast.success(`${formatINR(amt)} moved from Savings ✓`);
      onClose();
    } catch (err) {
      toast.error('Transfer failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedAmt    = parseFloat(amount) || 0;
  const afterBalance = savingsBalance - parsedAmt;

  return (
    <div className="sheet-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Transfer from Savings">
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Top Up Account</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              Transfer from Savings
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Savings balance info */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(90,158,111,0.10)', border: '1px solid rgba(90,158,111,0.20)',
          borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 20,
        }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>Savings balance</div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.375rem', color: 'var(--credit)', letterSpacing: '-0.02em' }}>
              {formatINR(savingsBalance)}
            </div>
          </div>
          {parsedAmt > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>After transfer</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.375rem', color: afterBalance < 0 ? 'var(--debit)' : 'var(--text)', letterSpacing: '-0.02em' }}>
                {formatINR(afterBalance)}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <span className="label">Amount to transfer (₹)</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--r-lg)', padding: '4px 16px',
              border: `2px solid ${parsedAmt > 0 ? 'rgba(217,119,87,0.30)' : 'transparent'}`,
              transition: 'border-color 0.2s',
            }}>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.75rem', color: 'var(--text-muted)', lineHeight: 1, paddingBottom: 2, flexShrink: 0 }}>₹</span>
              <input
                id="transfer-amount"
                ref={inputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2rem', fontWeight: 400,
                  color: parsedAmt > 0 ? 'var(--accent)' : 'var(--text-muted)',
                  letterSpacing: '-0.03em', lineHeight: 1.2, padding: '10px 0', width: '100%',
                }}
              />
            </div>
            {/* Quick Topup Presets */}
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginTop: 10, 
              overflowX: 'auto', 
              paddingBottom: 4, 
              width: '100%', 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}>
              {[100, 500, 1000, 2000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    borderRadius: 'var(--r-pill)',
                    background: parsedAmt === val ? 'var(--accent)' : 'var(--border)',
                    border: '1px solid transparent',
                    color: parsedAmt === val ? '#fff' : 'var(--text-secondary)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-group">
            <span className="label">Note — optional</span>
            <input id="transfer-note" type="text" placeholder="e.g. Mid-month top-up" value={note} onChange={e => setNote(e.target.value)} className="input-field" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading || !amount || parsedAmt <= 0} id="submit-transfer">
            {loading ? 'Transferring…' : (
              <><ArrowRight size={16} />Transfer {parsedAmt > 0 ? formatINR(parsedAmt) : 'Now'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Public shell ─────────────────────────────────────────────────────────────
export function TransferSheet({ isOpen, onClose, savingsBalance }: TransferSheetProps) {
  if (!isOpen) return null;
  return <TransferSheetContent onClose={onClose} savingsBalance={savingsBalance} />;
}
