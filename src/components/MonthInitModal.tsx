import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";
import { updateSheetOpenState } from "../utils/modalHelper";
import { formatMonthYear } from "../utils/dateUtils";
import { useCategories } from "../hooks/useCategories";
import { useMonthInit } from "../hooks/useMonthInit";
import { SpendingSection } from "./month-init/SpendingSection";
import { CategoryBudgetsSection } from "./month-init/CategoryBudgetsSection";
import { SavingsSection } from "./month-init/SavingsSection";
import { useBackHandler } from "../hooks/useBackHandler";

interface MonthInitModalProps {
  isOpen: boolean;
  onClose?: () => void;
  monthYear: string;
  onSaved: () => void;
  isEdit?: boolean;
}

interface ContentProps {
  onClose?: () => void;
  monthYear: string;
  onSaved: () => void;
  isEdit: boolean;
}

function MonthInitContent({
  onClose,
  monthYear,
  onSaved,
  isEdit,
}: ContentProps) {
  useBackHandler(!!onClose, () => {
    if (onClose) onClose();
  });

  const {
    expendBalance,
    setExpendBalance,
    savingsBalance,
    setSavingsBalance,
    budget,
    setBudget,
    includeTransfer,
    setIncludeTransfer,
    transferAmount,
    setTransferAmount,
    loading,
    catBudgets,
    setCatBudgets,
    catDueDays,
    setCatDueDays,
    showCatBudgets,
    setShowCatBudgets,
    handleBlur,
    handleSubmit,
    copyFromPreviousMonth,
  } = useMonthInit({ onClose, monthYear, onSaved, isEdit });

  const categoriesDb = useCategories();

  const budgetableCategories = categoriesDb
    .map((c) => c.name)
    .filter(
      (name) => name.toLowerCase() !== "transfer" && name.toLowerCase() !== "other",
    );

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (onClose && e.target === e.currentTarget) onClose();
  };

  const monthLabel = formatMonthYear(monthYear);

  return (
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${isEdit ? "Edit" : "Set up"} budget for ${monthLabel}`}
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              {isEdit ? "Edit Budget Setup" : "New Month Setup"}
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              {monthLabel} —{" "}
              {isEdit ? "Adjust your limits" : "Set your opening balances"}
            </p>
          </div>
          {onClose && (
            <button
              className="btn-ghost p-2 rounded-full"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto pr-1 pb-4"
        >
          {!isEdit && (
            <div className="bg-(--accent)/10 border border-(--accent)/20 rounded-xl p-3 mb-5 mt-2">
              <p className="text-[12px] leading-relaxed text-(--text) font-sans m-0">
                Your remaining balances from last month have been automatically carried forward. You can adjust them if needed.
              </p>
            </div>
          )}

          <SpendingSection
            expendBalance={expendBalance}
            setExpendBalance={setExpendBalance}
            budget={budget}
            setBudget={setBudget}
            handleBlur={handleBlur}
            isEdit={isEdit}
            copyFromPreviousMonth={copyFromPreviousMonth}
          />

          <CategoryBudgetsSection
            showCatBudgets={showCatBudgets}
            setShowCatBudgets={setShowCatBudgets}
            budgetableCategories={budgetableCategories}
            catBudgets={catBudgets}
            setCatBudgets={setCatBudgets}
            catDueDays={catDueDays}
            setCatDueDays={setCatDueDays}
            handleBlur={handleBlur}
          />

          <SavingsSection
            savingsBalance={savingsBalance}
            setSavingsBalance={setSavingsBalance}
            handleBlur={handleBlur}
            isEdit={isEdit}
            includeTransfer={includeTransfer}
            setIncludeTransfer={setIncludeTransfer}
            transferAmount={transferAmount}
            setTransferAmount={setTransferAmount}
          />

          <button
            type="submit"
            className="btn-primary w-full mt-5"
            disabled={loading}
            id="modal-btn-start-month"
          >
            {loading ? (
              "Saving…"
            ) : (
              <>
                {isEdit ? "Save Changes" : `Start ${monthLabel}`}
                <ChevronRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function MonthInitModal({
  isOpen,
  onClose,
  monthYear,
  onSaved,
  isEdit = false,
}: MonthInitModalProps) {
  if (!isOpen) return null;
  return createPortal(
    <MonthInitContent
      key={`${monthYear}-${isEdit}`}
      onClose={onClose}
      monthYear={monthYear}
      onSaved={onSaved}
      isEdit={isEdit}
    />,
    document.body,
  );
}
