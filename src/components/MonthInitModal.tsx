import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Wallet,
  PiggyBank,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { updateSheetOpenState } from "../utils/modalHelper";
import { formatMonthYear } from "../utils/dateUtils";
import { useCategories } from "../hooks/useCategories";
import { useMonthInit } from "../hooks/useMonthInit";

interface MonthInitModalProps {
  isOpen: boolean;
  onClose?: () => void;
  monthYear: string;
  onSaved: () => void;
  isEdit?: boolean;
}

// ── Inner content — mounts fresh each time isOpen flips to true ──────────────
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
    showCatBudgets,
    setShowCatBudgets,
    handleBlur,
    handleSubmit,
    copyFromPreviousMonth,
  } = useMonthInit({ onClose, monthYear, onSaved, isEdit });

  const categoriesDb = useCategories();

  // Categories excluding 'Transfer' and 'Other' (not meaningful budget targets)
  const budgetableCategories = categoriesDb
    .map((c) => c.name)
    .filter(
      (name) => name.toLowerCase() !== "transfer" && name.toLowerCase() !== "other",
    );

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

        {/* Header */}
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

          {/* ── Spending ──────────────────────────────── */}
          <SectionHeader
            icon={<Wallet size={15} className="text-(--accent)" />}
            bgClassName="bg-[rgba(217,119,87,0.12)]"
            label="Spending Wallet"
          />

          <div className="form-group">
            <label htmlFor="modal-expend-balance" className="label">
              Starting Balance (₹)
            </label>
            <input
              id="modal-expend-balance"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 25,000"
              value={expendBalance}
              onChange={(e) => setExpendBalance(e.target.value)}
              onBlur={() => handleBlur(expendBalance, setExpendBalance)}
              className="input-field"
              required
              autoFocus={!isEdit}
            />
          </div>

          <div className="form-group relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="modal-monthly-budget" className="label !mb-0">
                Monthly Budget (₹)
              </label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={copyFromPreviousMonth}
                  className="text-[10px] text-(--accent) font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  Copy from last month
                </button>
              )}
            </div>
            <input
              id="modal-monthly-budget"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 30,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onBlur={() => handleBlur(budget, setBudget)}
              className="input-field"
              required
            />
          </div>

          {/* ── Category Budgets ──────────────────────────── */}
          <div className="divider my-4.5" />
          <div
            className={`flex items-center justify-between cursor-pointer ${
              showCatBudgets ? "mb-3.5" : "mb-0"
            } select-none`}
            onClick={() => setShowCatBudgets((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && setShowCatBudgets((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-[9px] bg-[rgba(217,119,87,0.12)] flex items-center justify-center">
                <Wallet size={15} className="text-(--accent)" />
              </div>
              <span className="font-sans text-sm font-semibold tracking-tight">
                Category Budgets{" "}
                <span className="font-normal opacity-60 text-[0.8125rem]">
                  — optional
                </span>
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-(--text-muted) transition-transform duration-200 ${
                showCatBudgets ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {(() => {
            const activeCategories = budgetableCategories.filter(
              (cat) => catBudgets[cat] !== undefined && catBudgets[cat] !== "" && catBudgets[cat] !== "0"
            );
            const inactiveCategories = budgetableCategories.filter(
              (cat) => catBudgets[cat] === undefined || catBudgets[cat] === "" || catBudgets[cat] === "0"
            );

            return showCatBudgets && (
              <div className="flex flex-col gap-4 mb-3">
                {/* Active Category Budgets */}
                {activeCategories.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
                      Active Budgets ({activeCategories.length})
                    </div>
                    {activeCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2.5 bg-black/2 dark:bg-white/2 p-2 rounded-xl border border-black/5 dark:border-white/5">
                        <span className="font-sans text-[0.8125rem] font-medium text-(--text) min-w-[90px] shrink-0 pl-1">
                          {cat}
                        </span>
                        <div className="flex-1 flex items-center gap-1 bg-(--bg-surface) rounded-(--r-md) px-2.5 border border-black/8 dark:border-white/6">
                          <span className="text-[0.8125rem] text-(--text-muted) font-medium">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Enter limit"
                            value={catBudgets[cat] || ""}
                            onChange={(e) =>
                              setCatBudgets((prev) => ({
                                ...prev,
                                [cat]: e.target.value,
                              }))
                            }
                            onBlur={() => {
                              const val = catBudgets[cat];
                              if (val)
                                handleBlur(val, (v) =>
                                  setCatBudgets((prev) => ({ ...prev, [cat]: v })),
                                );
                            }}
                            className="border-none bg-transparent outline-none font-sans text-sm font-semibold text-(--text) py-2 w-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCatBudgets((prev) => ({
                              ...prev,
                              [cat]: "0",
                            }));
                          }}
                          className="btn-ghost p-1.5 min-h-0 h-auto rounded-full text-(--text-muted) hover:text-(--debit) cursor-pointer"
                          title="Remove budget"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inactive Categories (Pills to Add) */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
                    {activeCategories.length > 0 ? "Add budget for other categories" : "Select categories to budget"}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {inactiveCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCatBudgets((prev) => ({
                            ...prev,
                            [cat]: "",
                          }));
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/4 text-(--text-secondary) hover:text-(--text) hover:bg-black/5 dark:hover:bg-white/6 hover:border-black/15 cursor-pointer transition-all flex items-center gap-1 select-none"
                      >
                        <span>+</span> {cat}
                      </button>
                    ))}
                    {inactiveCategories.length === 0 && (
                      <span className="text-xs text-(--text-muted) italic">All categories have budgets set.</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Savings ──────────────────── */}
          <div className="divider my-5" />

          <SectionHeader
            icon={<PiggyBank size={15} className="text-(--credit)" />}
            bgClassName="bg-[rgba(90,158,111,0.12)]"
            label="Savings Wallet"
          />

          <div className="form-group">
            <label htmlFor="modal-savings-balance" className="label">
              Starting Balance (₹)&nbsp;
              <span className="font-normal opacity-70">— optional</span>
            </label>
            <input
              id="modal-savings-balance"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 1,50,000"
              value={savingsBalance}
              onChange={(e) => setSavingsBalance(e.target.value)}
              onBlur={() => handleBlur(savingsBalance, setSavingsBalance)}
              className="input-field"
            />
          </div>

          {/* Transfer toggle (new setup only) */}
          {!isEdit && (
            <>
              {/* Transfer toggle */}
              <div
                className={`flex items-center gap-2.5 cursor-pointer py-2.5 px-0 select-none ${
                  includeTransfer ? "mb-3.5" : "mb-0"
                }`}
                onClick={() => setIncludeTransfer((v) => !v)}
                role="checkbox"
                aria-checked={includeTransfer}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === " " && setIncludeTransfer((v) => !v)
                }
                id="modal-toggle-starting-transfer"
              >
                <div
                  className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-all duration-180 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0 ${
                    includeTransfer
                      ? "border-(--accent) bg-(--accent)"
                      : "border-(--text-muted) bg-transparent"
                  }`}
                >
                  {includeTransfer && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4L4.5 7.5L11 1"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-sans text-sm font-medium">
                  Log an opening transfer from Savings
                </span>
              </div>

              {includeTransfer && (
                <div className="form-group p-3.5 bg-(--bg-glass-weak) rounded-(--r-lg) border border-(--accent)/25">
                  <label htmlFor="modal-transfer-amt" className="label">
                    Transfer Amount (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <PiggyBank size={15} className="text-(--credit) shrink-0" />
                    <ArrowRight
                      size={13}
                      className="text-(--text-muted) shrink-0"
                    />
                    <Wallet size={15} className="text-(--accent) shrink-0" />
                    <input
                      id="modal-transfer-amt"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      onBlur={() =>
                        handleBlur(transferAmount, setTransferAmount)
                      }
                      className="input-field flex-1 mb-0!"
                    />
                  </div>
                </div>
              )}
            </>
          )}

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

// ── Small helper for section icons/labels ────────────────────────────────────
function SectionHeader({
  icon,
  bgClassName,
  label,
}: {
  icon: React.ReactNode;
  bgClassName: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <div
        className={`w-7.5 h-7.5 rounded-[9px] flex items-center justify-center ${bgClassName}`}
      >
        {icon}
      </div>
      <span className="font-sans text-sm font-semibold tracking-tight">
        {label}
      </span>
    </div>
  );
}

// ── Public shell — mounts inner content only when open ───────────────────────
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
