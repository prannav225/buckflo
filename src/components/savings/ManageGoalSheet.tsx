import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateSavingGoal, deleteSavingGoal, type SavingGoal } from '../../db/database';
import { formatINR } from '../../utils/currency';
import { CustomDatePicker } from '../CustomDatePicker';
import { useConfirm } from '../../hooks/useConfirm';
import { updateSheetOpenState } from '../../utils/modalHelper';

function ManageGoalSheetContent({
  onClose,
  goal,
  unallocatedBalance
}: {
  onClose: () => void;
  goal: SavingGoal;
  unallocatedBalance: number;
}) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [allocated, setAllocated] = useState(goal.currentAllocated.toString());
  const [deadline, setDeadline] = useState(goal.deadline || '');
  const [loading, setLoading] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirm();

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

  const maxAllowed = unallocatedBalance + goal.currentAllocated;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Goal',
      message: `Delete "${goal.name}"? The allocated ${formatINR(goal.currentAllocated)} will be returned to your unallocated savings.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteSavingGoal(goal.id!);
      toast.success(`Goal "${goal.name}" deleted.`);
      onClose();
    } catch (err) {
      toast.error('Failed to delete goal.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter a goal name'); return; }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) { toast.error('Please enter a valid target amount'); return; }
    const alloc = parseFloat(allocated) || 0;
    if (alloc < 0) { toast.error('Allocation cannot be negative'); return; }
    if (alloc > maxAllowed) {
      toast.error(`Allocation exceeds maximum allowed amount (${formatINR(maxAllowed)})`);
      return;
    }
    if (alloc > target) {
      toast.error('Allocation cannot exceed target amount');
      return;
    }

    setLoading(true);
    try {
      await updateSavingGoal(goal.id!, {
        name: name.trim(),
        targetAmount: target,
        currentAllocated: alloc,
        deadline: deadline || undefined,
      });
      toast.success(`Goal "${name.trim()}" updated!`);
      onClose();
    } catch (err) {
      toast.error('Failed to update goal.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedTarget = parseFloat(targetAmount) || 0;
  const parsedAlloc = parseFloat(allocated) || 0;

  return (
    <>
      <div className="sheet-overlay" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label={`Manage Goal ${goal.name}`}>
        <div className="sheet-panel">
          <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Manage Goal</h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {goal.name}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleDelete}
              aria-label="Delete Goal"
              style={{ padding: '8px', color: 'var(--debit)' }}
            >
              <Trash2 size={20} />
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              aria-label="Close"
              style={{ padding: '8px', borderRadius: '50%' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Allocation */}
          <div className="form-group" style={{ background: 'rgba(217,119,87,0.04)', padding: 14, borderRadius: 'var(--r-lg)', border: '1px solid rgba(217,119,87,0.1)' }}>
            <span className="label" style={{ color: 'var(--accent)', fontWeight: 600 }}>Allocated Amount (₹)</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--r-md)', padding: '2px 12px',
              border: `2px solid ${parsedAlloc > 0 ? 'rgba(217,119,87,0.20)' : 'transparent'}`,
              marginTop: 6,
            }}>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.5rem', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={allocated}
                onChange={e => setAllocated(e.target.value)}
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.75rem', fontWeight: 400,
                  color: 'var(--text)', padding: '6px 0', width: '100%'
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Max allocatable: <strong>{formatINR(maxAllowed)}</strong></span>
              <span>Available unallocated: <strong>{formatINR(unallocatedBalance)}</strong></span>
            </div>
          </div>

          {/* Goal Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <span className="label">Goal Name</span>
              <input
                type="text"
                placeholder="Goal Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
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

            <div className="form-group" style={{ margin: 0 }}>
              <span className="label">Target Date (Optional)</span>
              <CustomDatePicker value={deadline} onChange={setDeadline} />
            </div>
          </div>

          {parsedTarget > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 4px', textAlign: 'center' }}>
              Goal Progress: <strong>{Math.round(Math.min(100, (parsedAlloc / parsedTarget) * 100))}%</strong> ({formatINR(parsedAlloc)} of {formatINR(parsedTarget)})
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading || !name || !targetAmount}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
        </div>
      </div>
      {confirmDialog}
    </>
  );
}

export function ManageGoalSheet({
  isOpen,
  onClose,
  goal,
  unallocatedBalance
}: {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingGoal | null;
  unallocatedBalance: number;
}) {
  if (!isOpen || !goal) return null;
  return createPortal(
    <ManageGoalSheetContent onClose={onClose} goal={goal} unallocatedBalance={unallocatedBalance} />,
    document.body
  );
}
