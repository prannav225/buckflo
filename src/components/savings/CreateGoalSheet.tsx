import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { formatINR } from "../../utils/currency";
import { CustomDatePicker } from "../CustomDatePicker";
import { useCreateGoal } from "../../hooks/useCreateGoal";
import { useBackHandler } from "../../hooks/useBackHandler";

interface CreateGoalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  unallocatedBalance: number;
}

function CreateGoalSheetContent({
  onClose,
  unallocatedBalance,
}: {
  onClose: () => void;
  unallocatedBalance: number;
}) {
  useBackHandler(true, onClose);

  const {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    initialAllocation,
    setInitialAllocation,
    deadline,
    setDeadline,
    loading,
    inputRef,
    handleSubmit,
    parsedTarget,
    parsedInitial,
  } = useCreateGoal(unallocatedBalance, onClose);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Create Savings Goal"
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              New Savings Goal
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              Create a virtual jar for your savings
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Goal Name */}
          <div className="form-group">
            <span className="label">Goal Name</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Target Amount & Initial Allocation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <span className="label">Target Amount (₹)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
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
                onChange={(e) => setInitialAllocation(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Info helper */}
          <div className="text-xs text-(--text-muted) flex justify-between px-1">
            <span>
              Unallocated: <strong>{formatINR(unallocatedBalance)}</strong>
            </span>
            {parsedTarget > 0 && parsedInitial > 0 && (
              <span>
                Progress:{" "}
                <strong>
                  {Math.round(
                    Math.min(100, (parsedInitial / parsedTarget) * 100),
                  )}
                  %
                </strong>
              </span>
            )}
          </div>

          {/* Target Date */}
          <div className="form-group">
            <span className="label">Target Date (Optional)</span>
            <CustomDatePicker value={deadline} onChange={setDeadline} />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading || !name || !targetAmount}
          >
            {loading ? "Creating…" : "Create Savings Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function CreateGoalSheet({
  isOpen,
  onClose,
  unallocatedBalance,
}: CreateGoalSheetProps) {
  if (!isOpen) return null;
  return createPortal(
    <CreateGoalSheetContent
      onClose={onClose}
      unallocatedBalance={unallocatedBalance}
    />,
    document.body,
  );
}
