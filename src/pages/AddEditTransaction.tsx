import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  ArrowLeft,
} from "lucide-react";
import { useTransactionForm } from "../hooks/useTransactionForm";
import { useConfirm } from "../hooks/useConfirm";
import { formatINR } from "../utils/currency";
import { CustomDatePicker } from "../components/CustomDatePicker";
import { SegmentedControl } from "../components/ui/SegmentedControl";

import { CATEGORIES } from "../utils/categories";

export function AddEditTransaction() {
  const navigate = useNavigate();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const {
    date,
    setDate,
    description,
    setDescription,
    amount,
    setAmount,
    type,
    setType,
    accountId,
    setAccountId,
    category,
    setCategory,
    loading,
    fetching,
    isEdit,
    expendAcc,
    savingsAcc,
    handleSubmit,
    handleDelete,
  } = useTransactionForm();

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus amount on mount for add mode (after data load)
  useEffect(() => {
    if (!fetching && !isEdit) {
      const t = setTimeout(() => amountInputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [fetching, isEdit]);

  if (fetching) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-(--border) border-t-(--accent) rounded-full animate-spin" />
      </div>
    );
  }

  const parsedAmt = parseFloat(amount) || 0;

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted)"
            onClick={() => navigate(-1)}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">
            {isEdit ? "Edit Entry" : "Add Entry"}
          </h2>
        </div>
        {isEdit && (
          <button
            type="button"
            className="btn-ghost text-(--debit) flex items-center gap-1.5"
            onClick={() =>
              handleDelete(() =>
                confirm({
                  title: "Delete Entry",
                  message:
                    "Are you sure you want to delete this entry? This action cannot be undone.",
                  confirmLabel: "Delete",
                  variant: "danger",
                }),
              )
            }
            id="delete-entry-btn"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Transaction Type Toggle */}
        <SegmentedControl
          idPrefix="page-type"
          options={["debit", "credit"] as const}
          value={type}
          onChange={(val) => setType(val)}
          className="fade-in-up max-w-[320px] mx-auto mb-3"
          renderLabel={(option) =>
            option === "debit" ? (
              <>
                <ArrowDownLeft size={12} strokeWidth={2.5} /> Expense
              </>
            ) : (
              <>
                <ArrowUpRight size={12} strokeWidth={2.5} /> Income
              </>
            )
          }
        />

        {/* Amount Hero Card — tappable display */}
        <div
          className={`hero-card ${type === "debit" ? "hero-card-orange" : "hero-card-green"} fade-in-up delay-1 cursor-text`}
          onClick={() => amountInputRef.current?.focus()}
        >
          <div className="hero-card-orb-lg" />
          <div className="hero-card-orb-sm" />

          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[0.6875rem] font-semibold text-[rgba(255,255,255,0.65)] tracking-[0.08em] uppercase">
              Amount
            </span>
            <span className="font-sans text-[0.6875rem] text-[rgba(255,255,255,0.50)] tracking-wider">
              Tap to edit
            </span>
          </div>

          <div className="amount-display flex items-baseline text-white relative z-10">
            <span
              className="text-[clamp(1.75rem,8vw,2.25rem)] mr-1.5 font-medium opacity-85"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(1.75rem, 8vw, 2.25rem)",
              }}
            >
              ₹
            </span>
            <input
              id="page-tx-amount"
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className={`bg-transparent border-none outline-none text-[clamp(2.25rem,10vw,3rem)] ${
                parsedAmt > 0 ? "text-white" : "text-[rgba(255,255,255,0.40)]"
              } w-full p-0 m-0 shadow-none leading-none font-normal`}
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "clamp(2.25rem, 10vw, 3rem)",
              }}
            />
          </div>
        </div>

        {/* Details Card */}
        <div className="glass-card fade-in-up delay-2 p-5 flex flex-col gap-4">
          {/* Description */}
          <div className="form-group m-0">
            <label className="label" htmlFor="page-tx-desc">
              Description
            </label>
            <input
              id="page-tx-desc"
              type="text"
              placeholder="What was this transaction for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Account */}
          <div className="form-group m-0">
            <span className="label">Account</span>
            <div className="flex gap-2.5">
              {expendAcc && (
                <button
                  type="button"
                  className={`chip flex-1 py-3 px-4 rounded-(--r-md) text-sm flex items-center justify-center gap-2 ${
                    accountId === expendAcc.id ? "chip-active" : ""
                  }`}
                  onClick={() => setAccountId(expendAcc.id!)}
                  id="page-acc-expenditure"
                >
                  <CreditCard size={16} /> <span>Expenditure</span>
                </button>
              )}
              {savingsAcc && (
                <button
                  type="button"
                  className={`chip flex-1 py-3 px-4 rounded-(--r-md) text-sm flex items-center justify-center gap-2 ${
                    accountId === savingsAcc.id ? "chip-active" : ""
                  }`}
                  onClick={() => setAccountId(savingsAcc.id!)}
                  id="page-acc-savings"
                >
                  <PiggyBank size={16} /> <span>Savings</span>
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="form-group m-0">
            <span className="label">
              Category{" "}
              <span className="font-normal opacity-60">— optional</span>
            </span>
            <div
              id="category-pills-scroll"
              className="chip-scroll flex gap-2 overflow-x-auto pb-1 w-full touch-pan-x"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip whitespace-nowrap py-2 px-4 text-[0.8125rem] ${
                    category === c ? "chip-active" : ""
                  }`}
                  onClick={() => setCategory(category === c ? "" : c)}
                  id={`page-cat-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group m-0">
            <label className="label" htmlFor="page-tx-date">
              Date
            </label>
            <CustomDatePicker
              id="page-tx-date"
              value={date}
              onChange={setDate}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="fade-in-up delay-3 mt-1">
          <button
            type="submit"
            className={`btn-primary w-full py-3.5 px-7 rounded-(--r-pill) transition-[background,box-shadow,transform] duration-300 ease-in-out ${
              type === "debit"
                ? "bg-(--debit) shadow-[0_6px_20px_rgba(224,85,69,0.25)]"
                : "bg-(--credit) shadow-[0_6px_20px_rgba(90,158,111,0.25)]"
            }`}
            disabled={loading || !amount || !description}
            id="page-submit-transaction"
          >
            {loading ? (
              "Saving…"
            ) : (
              <>
                <Check size={18} strokeWidth={2.5} />
                {isEdit
                  ? "Save Changes"
                  : `Save ${type === "debit" ? "Expense" : "Income"}`}
                {parsedAmt > 0 && (
                  <span className="opacity-85 font-normal">
                    · {formatINR(parsedAmt)}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </form>
      {confirmDialog}
    </>
  );
}
