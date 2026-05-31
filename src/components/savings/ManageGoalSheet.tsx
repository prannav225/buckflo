import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Trash2 } from "lucide-react";
import { type SavingGoal } from "../../db/database";
import { formatINR } from "../../utils/currency";
import { CustomDatePicker } from "../CustomDatePicker";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { useManageGoal } from "../../hooks/useManageGoal";
import { todayISO } from "../../utils/dateUtils";

function ManageGoalSheetContent({
  onClose,
  goal,
  unallocatedBalance,
}: {
  onClose: () => void;
  goal: SavingGoal;
  unallocatedBalance: number;
}) {
  const {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    allocated,
    setAllocated,
    deadline,
    setDeadline,
    loading,
    maxAllowed,
    handleDelete,
    handleSubmit,
    parsedTarget,
    parsedAlloc,
    confirmDialog,
  } = useManageGoal(goal, unallocatedBalance, onClose);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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

  return (
    <>
      <div
        className="sheet-overlay"
        onClick={handleBackdrop}
        role="dialog"
        aria-modal="true"
        aria-label={`Manage Goal ${goal.name}`}
      >
        <div className="sheet-panel">
          <div className="sheet-handle" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
                Manage Goal
              </h2>
              <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
                {goal.name}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="btn-ghost p-2 text-(--debit) rounded-full"
                onClick={handleDelete}
                aria-label="Delete Goal"
              >
                <Trash2 size={20} />
              </button>
              <button
                type="button"
                className="btn-ghost p-2 rounded-full"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Allocation */}
            <div className="form-group bg-[rgba(217,119,87,0.04)] p-3.5 rounded-(--r-lg) border border-[rgba(217,119,87,0.1)]">
              <span className="label text-(--accent)! font-semibold">
                Allocated Amount (₹)
              </span>
              <div
                className={`flex items-center gap-2 bg-[rgba(0,0,0,0.05)] rounded-(--r-md) px-3 py-0.5 border-2 ${
                  parsedAlloc > 0
                    ? "border-[rgba(217,119,87,0.2)]"
                    : "border-transparent"
                } mt-1.5`}
              >
                <span className="font-display text-2xl text-(--text-muted)">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={allocated}
                  onChange={(e) => setAllocated(e.target.value)}
                  className="flex-1 border-none bg-transparent outline-none font-display text-3xl font-normal text-(--text) py-1.5 w-full"
                />
              </div>
              <div className="text-xs text-(--text-muted) mt-2 flex justify-between">
                <span>
                  Max allocatable: <strong>{formatINR(maxAllowed)}</strong>
                </span>
                <span>
                  Available unallocated:{" "}
                  <strong>{formatINR(unallocatedBalance)}</strong>
                </span>
              </div>
            </div>

            {/* Goal Details */}
            <div className="flex flex-col gap-4">
              <div className="form-group m-0!">
                <span className="label">Goal Name</span>
                <input
                  type="text"
                  placeholder="Goal Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group m-0!">
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

              <div className="form-group !m-0">
                <span className="label">Target Date (Optional)</span>
                <CustomDatePicker value={deadline} onChange={setDeadline} />
              </div>
            </div>

            {parsedTarget > 0 && (
              <div className="text-xs text-(--text-muted) px-1 text-center flex flex-col gap-1.5">
                <div>
                  Goal Progress:{" "}
                  <strong>
                    {Math.round(
                      Math.min(100, (parsedAlloc / parsedTarget) * 100),
                    )}
                    %
                  </strong>{" "}
                  ({formatINR(parsedAlloc)} of {formatINR(parsedTarget)})
                </div>
                {(() => {
                  if (deadline && parsedAlloc < parsedTarget) {
                    const today = new Date(todayISO());
                    const dDate = new Date(deadline);
                    let monthsRemaining =
                      (dDate.getFullYear() - today.getFullYear()) * 12 +
                      (dDate.getMonth() - today.getMonth());
                    if (monthsRemaining <= 0) monthsRemaining = 1;
                    const required = (parsedTarget - parsedAlloc) / monthsRemaining;
                    return (
                      <div className="text-[11.5px] font-medium text-(--accent)">
                        To stay on track, allocate <strong>{formatINR(required)}</strong> this month.
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-1"
              disabled={loading || !name || !targetAmount}
            >
              {loading ? "Saving…" : "Save Changes"}
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
  unallocatedBalance,
}: {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingGoal | null;
  unallocatedBalance: number;
}) {
  if (!isOpen || !goal) return null;
  return createPortal(
    <ManageGoalSheetContent
      onClose={onClose}
      goal={goal}
      unallocatedBalance={unallocatedBalance}
    />,
    document.body,
  );
}
