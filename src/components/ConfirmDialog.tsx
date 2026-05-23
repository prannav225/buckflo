import { useRef, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

// ─── Shared Types (imported by useConfirm.ts) ─────────────────────────────────

export interface ConfirmOptions {
  title: string;
  message: string;
  /** Label for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Visual variant for the confirm button. Defaults to "danger". */
  variant?: 'danger' | 'default';
}

export interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// ─── ConfirmDialog UI Component ───────────────────────────────────────────────

interface ConfirmDialogProps {
  state: DialogState | null;
  onClose: () => void;
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus Cancel on open for accessibility
  useEffect(() => {
    if (state) {
      const t = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Escape to cancel
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        state.resolve(false);
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, onClose]);

  if (!state) return null;

  const isDanger = state.variant !== 'default';

  const handleConfirm = () => {
    state.resolve(true);
    onClose();
  };

  const handleCancel = () => {
    state.resolve(false);
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 9, 8, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        className="glass-card-strong pop-in"
        style={{
          width: '100%',
          maxWidth: '340px',
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--glass-shadow-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 'var(--r-md)',
            background: isDanger ? 'rgba(224, 85, 69, 0.10)' : 'rgba(217, 119, 87, 0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isDanger
              ? <Trash2 size={20} color="var(--debit)" />
              : <AlertTriangle size={20} color="var(--accent)" />
            }
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              {state.title}
            </h3>
            <p
              id="confirm-dialog-message"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: '6px 0 0',
                lineHeight: 1.5,
              }}
            >
              {state.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--r-pill)',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--r-pill)',
              border: 'none',
              background: isDanger ? 'var(--debit)' : 'var(--accent)',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {state.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
