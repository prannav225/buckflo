import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addSavingGoal } from '../../db/database';
import { formatINR } from '../../utils/currency';
import { CustomDatePicker } from '../CustomDatePicker';
import { updateSheetOpenState } from '../../utils/modalHelper';

function CreateGoalSheetContent({ onClose, unallocatedBalance }: { onClose: () => void; unallocatedBalance: number }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAllocation, setInitialAllocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Handle active overlay body class for inactive background visual dimming
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter a goal name'); return; }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) { toast.error('Please enter a valid target amount'); return; }
    const initial = parseFloat(initialAllocation) || 0;
    if (initial < 0) { toast.error('Initial allocation cannot be negative'); return; }
    if (initial > unallocatedBalance) {
      toast.error(`Initial allocation exceeds available unallocated savings (${formatINR(unallocatedBalance)})`);
      return;
    }
    if (initial > target) {
      toast.error('Initial allocation cannot exceed target amount');
      return;
    }

    setLoading(true);
    try {
      await addSavingGoal({
        name: name.trim(),
        targetAmount: target,
        currentAllocated: initial,
        deadline: deadline || undefined,
      });
      toast.success(`Savings Goal "${name}" created!`);
      onClose();
    } catch (err) {
      toast.error('Failed to create goal.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedTarget = parseFloat(targetAmount) || 0;
  const parsedInitial = parseFloat(initialAllocation) || 0;

  return (
    <div className="sheet-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Create Savings Goal">
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>New Savings Goal</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Create a virtual jar for your savings
            </p>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Goal Name */}
          <div className="form-group">
            <span className="label">Goal Name</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Target Amount & Initial Allocation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <span className="label">Target Amount (₹)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="form-group">
              <span className="label">Initial Allocation (₹)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={initialAllocation}
                onChange={e => setInitialAllocation(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Info helper */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            <span>Unallocated: <strong>{formatINR(unallocatedBalance)}</strong></span>
            {parsedTarget > 0 && parsedInitial > 0 && (
              <span>Progress: <strong>{Math.round(Math.min(100, (parsedInitial / parsedTarget) * 100))}%</strong></span>
            )}
          </div>

          {/* Target Date */}
          <div className="form-group">
            <span className="label">Target Date (Optional)</span>
            <CustomDatePicker value={deadline} onChange={setDeadline} />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading || !name || !targetAmount}
          >
            {loading ? 'Creating…' : 'Create Savings Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function CreateGoalSheet({ isOpen, onClose, unallocatedBalance }: { isOpen: boolean; onClose: () => void; unallocatedBalance: number }) {
  if (!isOpen) return null;
  return createPortal(
    <CreateGoalSheetContent onClose={onClose} unallocatedBalance={unallocatedBalance} />,
    document.body
  );
}
