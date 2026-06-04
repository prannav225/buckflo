import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { formatINR } from "../../utils/currency";
import { recordTransferBidirectional } from "../../db/database";
import { todayISO } from "../../utils/dateUtils";
import { useBackHandler } from "../../hooks/useBackHandler";
import toast from "react-hot-toast";

interface SavingsNudgeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spendingBalance: number;
  onSuccess: () => void;
}

export function SavingsNudgeSheet({
  isOpen,
  onClose,
  spendingBalance,
  onSuccess,
}: SavingsNudgeSheetProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useBackHandler(isOpen, onClose);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      updateSheetOpenState();
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => {
        clearTimeout(t);
        setTimeout(updateSheetOpenState, 0);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const parsedAmt = parseFloat(amount) || 0;
  const afterSpendingBalance = spendingBalance - parsedAmt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (parsedAmt > spendingBalance) {
      toast.error("Amount exceeds spending balance");
      return;
    }

    setLoading(true);
    try {
      await recordTransferBidirectional(
        parsedAmt,
        todayISO(),
        "spending",
        "savings",
        "Initial savings allocation",
        "transfer"
      );
      toast.success(`${formatINR(parsedAmt)} moved to Savings Wallet ✓`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Transfer failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="sheet-overlay animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Set Up Savings"
    >
      <div className="sheet-panel">
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
              Set up Savings Wallet
            </h2>
            <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
              How much do you want to move from your Spending Wallet?
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Source balance info */}
        <div className="flex items-center justify-between bg-(--bg-surface) border border-black/8 dark:border-white/6 shadow-(--glass-shadow) rounded-(--r-lg) p-[12px_16px] mb-5">
          <div>
            <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5">
              Spending Wallet Balance
            </div>
            <div className="font-display text-[1.375rem] text-(--text) tracking-tight">
              {formatINR(spendingBalance)}
            </div>
          </div>
          {parsedAmt > 0 && (
            <div className="text-right">
              <div className="font-sans text-xs text-(--text-muted) font-medium mb-0.5">
                Remaining Spending
              </div>
              <div
                className={`font-display text-[1.375rem] tracking-tight ${
                  afterSpendingBalance < 0 ? "text-(--debit)" : "text-(--text)"
                }`}
              >
                {formatINR(afterSpendingBalance)}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <span className="label">Amount to save (₹)</span>
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
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-4"
            disabled={loading || !amount || parsedAmt <= 0}
          >
            {loading ? (
              "Moving..."
            ) : (
              <>
                <ArrowRight size={16} />
                Move {parsedAmt > 0 ? formatINR(parsedAmt) : "Now"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
