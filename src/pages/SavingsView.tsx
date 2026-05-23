import { useState, useEffect, useRef } from 'react';
import { PiggyBank, Download, Plus, Target, Trash2, Calendar, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addSavingGoal, updateSavingGoal, deleteSavingGoal } from '../db/database';
import type { SavingGoal } from '../db/database';
import { useAccount, useTransactions, useRunningBalances, useMonthSummary } from '../db/hooks';
import { TransactionCard } from '../components/TransactionRow';
import { MonthPicker } from '../components/MonthPicker';
import { formatINR } from '../utils/currency';
import { getCurrentMonthYear, formatMonthYear, formatDate } from '../utils/dateUtils';
import { exportTransactionsCSV } from '../utils/csvExport';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { useConfirm } from '../hooks/useConfirm';
import toast from 'react-hot-toast';

// ─── Create Goal Sheet Component ─────────────────────────────────────────────
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
  return <CreateGoalSheetContent onClose={onClose} unallocatedBalance={unallocatedBalance} />;
}

// ─── Manage Goal Sheet Component ─────────────────────────────────────────────
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
  return <ManageGoalSheetContent onClose={onClose} goal={goal} unallocatedBalance={unallocatedBalance} />;
}

// ─── Main Savings View Component ─────────────────────────────────────────────
export function SavingsView() {
  const [monthYear, setMonthYear] = useState(getCurrentMonthYear());
  const isCurrentMonth = monthYear === getCurrentMonthYear();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);

  const savingsAcc  = useAccount('savings');
  const transactions = useTransactions(savingsAcc?.id, monthYear);

  // Fetch all savings transactions from the 1st of the selected month to today
  const txsSinceStart = useLiveQuery(
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

  // Reconstruct opening balance of the selected month by walking back from the current live balance
  const openingBalance = (() => {
    if (!savingsAcc) return 0;
    let bal = savingsAcc.currentBalance;
    for (const tx of txsSinceStart) {
      bal = tx.type === 'credit' ? bal - tx.amount : bal + tx.amount;
    }
    return +bal.toFixed(2);
  })();

  const runningBalances = useRunningBalances(transactions, openingBalance);
  const summary = useMonthSummary(transactions, openingBalance);

  // Fetch saving goals
  const savingGoals = useLiveQuery(() => db.savingGoals.toArray(), [], [] as SavingGoal[]);

  const totalAllocated = savingGoals.reduce((sum, goal) => sum + goal.currentAllocated, 0);
  const currentSavingsBalance = savingsAcc?.currentBalance ?? 0;
  const unallocatedBalance = currentSavingsBalance - totalAllocated;

  const handleExport = () => {
    exportTransactionsCSV(transactions, `flo-savings-${monthYear}.csv`);
  };

  // Staggered delay classes based on current month layout
  const pickerDelay = isCurrentMonth ? 'delay-2' : 'delay-1';
  const summaryDelay = isCurrentMonth ? 'delay-3' : 'delay-2';
  const listDelay = isCurrentMonth ? 'delay-4' : 'delay-3';

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="sub-header fade-in-up">
        <h2 className="sub-header-title">Savings</h2>
        <button
          className="btn-ghost"
          onClick={handleExport}
          disabled={transactions.length === 0}
          id="savings-export-csv"
          title="Export as CSV"
        >
          <Download size={16} />
          CSV
        </button>
      </div>

      {/* ── Balance Hero ──────────────────────────────────────────────────── */}
      <div className="hero-card hero-card-green fade-in-up" style={{ marginBottom: 12 }}>
        {/* Decorative glass orbs */}
        <div className="hero-card-orb-lg" />
        <div className="hero-card-orb-sm" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <PiggyBank size={14} color="rgba(255,255,255,0.65)" />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {isCurrentMonth ? 'Savings Balance' : 'Savings Closing Balance'}
          </span>
        </div>

        <div
          className="amount-display"
          style={{ fontSize: 'clamp(2.25rem, 10vw, 3rem)', color: '#fff' }}
        >
          {formatINR(isCurrentMonth ? currentSavingsBalance : summary.closingBalance)}
        </div>
      </div>

      {/* ── Savings Goal Jars ────────────────────────────────────────────── */}
      {isCurrentMonth && (
        <div className="fade-in-up delay-1" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingLeft: 4 }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
            }}>
              Goal Jars
            </h3>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 'var(--r-sm)'
              }}
              className="btn-ghost"
            >
              <Plus size={14} /> Add Jar
            </button>
          </div>

          {/* Unallocated balance card */}
          <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>
                Unallocated Savings
              </div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
                {formatINR(unallocatedBalance)}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              <div>Total Allocated</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{formatINR(totalAllocated)}</div>
            </div>
          </div>

          {/* Goal Grid */}
          {savingGoals.length === 0 ? (
            <div className="glass-card empty-state" style={{ padding: '24px 16px', minHeight: 'auto' }}>
              <Target size={28} className="empty-state-icon" style={{ opacity: 0.6 }} />
              <p className="empty-state-title" style={{ fontSize: '0.875rem' }}>No goal jars yet</p>
              <p className="empty-state-desc" style={{ fontSize: '0.75rem', maxWidth: '240px', margin: '4px auto 0' }}>
                Partition your savings into visual jars to track specific targets.
              </p>
            </div>
          ) : (
            <div className="goal-grid">
              {savingGoals.map((goal) => {
                const percent = Math.min(100, Math.max(0, goal.targetAmount > 0 ? (goal.currentAllocated / goal.targetAmount) * 100 : 0));
                const isCompleted = percent >= 100;
                
                // SVG Progress ring math
                const radius = 24;
                const stroke = 3;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percent / 100) * circumference;

                return (
                  <div
                    key={goal.id}
                    className={`goal-card ${isCompleted ? 'goal-card-completed' : ''}`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div className="progress-ring-wrapper">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        {/* Background circle */}
                        <circle
                          stroke="var(--border)"
                          fill="transparent"
                          strokeWidth={stroke}
                          r={radius}
                          cx="30"
                          cy="30"
                        />
                        {/* Foreground progress circle */}
                        <circle
                          className="progress-ring-circle"
                          stroke={isCompleted ? 'var(--credit)' : 'var(--accent)'}
                          fill="transparent"
                          strokeWidth={stroke}
                          strokeDasharray={`${circumference} ${circumference}`}
                          style={{ strokeDashoffset }}
                          r={radius}
                          cx="30"
                          cy="30"
                        />
                      </svg>
                      <span className="progress-ring-percent" style={{ fontSize: '0.6875rem' }}>
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <div className="goal-name">{goal.name}</div>
                    <div className="goal-amount">
                      {formatINR(goal.currentAllocated)}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      of {formatINR(goal.targetAmount)}
                    </div>
                    {goal.deadline && (
                      <div className="goal-deadline" style={{ marginTop: 6 }}>
                        <Calendar size={10} />
                        <span>{formatDate(goal.deadline)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Month Picker ─────────────────────────────────────────────────── */}
      <div className={`glass-card fade-in-up ${pickerDelay}`} style={{ padding: '14px 18px', marginBottom: 12 }}>
        <MonthPicker monthYear={monthYear} onChange={setMonthYear} isSavings={true} />
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div className={`summary-grid fade-in-up ${summaryDelay}`} style={{ marginBottom: 12 }}>
        <div className="summary-card">
          <div className="label">Transferred Out</div>
          <div className="amount-display amount-debit" style={{ fontSize: '1.125rem', marginTop: 4 }}>
            {formatINR(summary.totalDebited)}
          </div>
        </div>
        <div className="summary-card">
          <div className="label">Credited In</div>
          <div className="amount-display amount-credit" style={{ fontSize: '1.125rem', marginTop: 4 }}>
            {formatINR(summary.totalCredited)}
          </div>
        </div>
      </div>

      {/* ── Transaction List ──────────────────────────────────────────────── */}
      <div className={`fade-in-up ${listDelay}`}>
        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '10px',
          paddingLeft: '4px'
        }}>
          Savings Transactions
        </h3>
        {transactions.length === 0 ? (
          <div className="glass-card empty-state" style={{ marginTop: 12 }}>
            <PiggyBank size={32} className="empty-state-icon" />
            <p className="empty-state-title">No savings activity</p>
            <p className="empty-state-desc">
              No savings activity for {formatMonthYear(monthYear)}.
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 8 }}>
            {transactions.map((tx, i) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                runningBalance={runningBalances[i]}
                showRunningBalance={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sheets / Overlays */}
      <CreateGoalSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        unallocatedBalance={unallocatedBalance}
      />

      <ManageGoalSheet
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        unallocatedBalance={unallocatedBalance}
      />
    </>
  );
}
