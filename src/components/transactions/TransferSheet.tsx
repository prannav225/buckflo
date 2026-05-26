import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { useAccount } from "../../db/hooks";
import { formatINR } from "../../utils/currency";
import { useTransferForm } from "../../hooks/useTransferForm";
import { SegmentedControl } from "../ui/SegmentedControl";

interface TransferSheetProps {
  isOpen: boolean;
  onClose: () => void;
  savingsBalance: number;
  defaultDirection?: "savings_to_expenditure" | "expenditure_to_savings";
  defaultAmount?: string;
  defaultNote?: string;
}

// ── Inner content — mounts fresh on every open, eliminating setState-in-effect ─
function TransferSheetContent({
  onClose,
  defaultDirection = "savings_to_expenditure",
  defaultAmount = "",
  defaultNote = "",
}: Omit<TransferSheetProps, "isOpen" | "savingsBalance">) {
  const savingsAcc = useAccount("savings");
  const expendAcc = useAccount("expenditure");
  const savingsBalance = savingsAcc?.currentBalance ?? 0;
  const expenditureBalance = expendAcc?.currentBalance ?? 0;

  const {
    direction,
    setDirection,
    amount,
    setAmount,
    note,
    setNote,
    loading,
    inputRef,
    handleSubmit,
    parsedAmt,
    currentSourceBalance,
    afterSourceBalance,
  } = useTransferForm({
    defaultDirection,
    defaultAmount,
    defaultNote,
    onClose,
    savingsBalance,
    expenditureBalance,
  });

  // Handle active overlay body class for inactive background visual dimming
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="sheet-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Account Transfer"
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              Transfer Funds
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              Move money between accounts
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Direction Segmented Control */}
        <SegmentedControl
          idPrefix="transfer-dir"
          options={["savings_to_expenditure", "expenditure_to_savings"] as const}
          value={direction}
          onChange={(val) => {
            setDirection(val);
            setAmount("");
          }}
          className="max-w-[320px] mx-auto mb-5"
          renderLabel={(option) =>
            option === "savings_to_expenditure"
              ? "Savings → Expenditure"
              : "Expenditure → Savings"
          }
        />

        {/* Source balance info */}
        <div className="flex items-center justify-between bg-(--bg-surface) border border-black/8 dark:border-white/6 shadow-(--glass-shadow) rounded-(--r-lg) p-[12px_16px] mb-5">
          <div>
            <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5">
              {direction === "savings_to_expenditure"
                ? "Savings account balance"
                : "Expenditure account balance"}
            </div>
            <div className="font-display text-[1.375rem] text-(--text) tracking-tight">
              {formatINR(currentSourceBalance)}
            </div>
          </div>
          {parsedAmt > 0 && (
            <div className="text-right">
              <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5">
                After transfer
              </div>
              <div
                className={`font-display text-[1.375rem] tracking-tight ${
                  afterSourceBalance < 0 ? "text-(--debit)" : "text-(--text)"
                }`}
              >
                {formatINR(afterSourceBalance)}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <span className="label">Amount to transfer (₹)</span>
            <div
              className={`flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-(--r-lg) px-4 py-1 border-2 transition-colors duration-200 ${
                parsedAmt > 0
                  ? "border-[rgba(217,119,87,0.3)]"
                  : "border-transparent"
              }`}
            >
              <span className="font-display text-3xl text-(--text-muted) leading-none pb-0.5 shrink-0">
                ₹
              </span>
              <input
                id="transfer-amount"
                ref={inputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={`flex-1 border-none bg-transparent outline-none font-display text-4xl font-normal tracking-tight leading-normal py-2.5 w-full ${
                  parsedAmt > 0 ? "text-(--accent)" : "text-(--text-muted)"
                }`}
              />
            </div>
            {/* Quick Topup Presets */}
            <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 w-full [webkit-overflow-scrolling:touch] scrollbar-none">
              {[100, 500, 1000, 2000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`shrink-0 py-2 px-3.5 rounded-(--r-pill) border border-transparent font-sans text-[0.8125rem] font-semibold cursor-pointer ${
                    parsedAmt === val
                      ? "bg-(--accent) text-white"
                      : "bg-(--border) text-(--text-secondary)"
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-group">
            <span className="label">Note — optional</span>
            <input
              id="transfer-note"
              type="text"
              placeholder={
                direction === "savings_to_expenditure"
                  ? "e.g. Mid-month top-up"
                  : "e.g. Smart allocation"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading || !amount || parsedAmt <= 0}
            id="submit-transfer"
          >
            {loading ? (
              "Transferring…"
            ) : (
              <>
                <ArrowRight size={16} />
                Transfer {parsedAmt > 0 ? formatINR(parsedAmt) : "Now"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Public shell ─────────────────────────────────────────────────────────────
export function TransferSheet({
  isOpen,
  onClose,
  defaultDirection = "savings_to_expenditure",
  defaultAmount = "",
  defaultNote = "",
}: TransferSheetProps) {
  if (!isOpen) return null;
  return createPortal(
    <TransferSheetContent
      onClose={onClose}
      defaultDirection={defaultDirection}
      defaultAmount={defaultAmount}
      defaultNote={defaultNote}
    />,
    document.body,
  );
}
