/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { updateSheetOpenState } from "../utils/modalHelper";
import { recordTransferBidirectional } from "../db/database";
import { useAccount } from "../db/hooks";
import { todayISO } from "../utils/dateUtils";
import { formatINR } from "../utils/currency";
import toast from "react-hot-toast";

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

  const [direction, setDirection] = useState<
    "savings_to_expenditure" | "expenditure_to_savings"
  >(defaultDirection);
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState(defaultNote);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount (no reset needed — fresh mount every time)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const currentSourceBalance =
      direction === "savings_to_expenditure"
        ? savingsBalance
        : expenditureBalance;
    if (amt > currentSourceBalance) {
      toast.error(
        `Amount exceeds ${direction === "savings_to_expenditure" ? "savings" : "expenditure"} balance`,
      );
      return;
    }

    setLoading(true);
    try {
      const fromType =
        direction === "savings_to_expenditure" ? "savings" : "expenditure";
      const toType =
        direction === "savings_to_expenditure" ? "expenditure" : "savings";
      const defaultNoteText =
        direction === "savings_to_expenditure"
          ? "Transfer to Expenditure"
          : "Transfer to Savings";

      await recordTransferBidirectional(
        amt,
        todayISO(),
        fromType,
        toType,
        note || defaultNoteText,
        "transfer",
      );
      toast.success(`${formatINR(amt)} moved successfully ✓`);
      onClose();
    } catch (err) {
      toast.error("Transfer failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parsedAmt = parseFloat(amount) || 0;
  const currentSourceBalance =
    direction === "savings_to_expenditure"
      ? savingsBalance
      : expenditureBalance;
  const afterSourceBalance = currentSourceBalance - parsedAmt;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
              Transfer Funds
            </h2>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Move money between accounts
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: "8px", borderRadius: "50%" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Direction Segmented Control */}
        <div className="seg-control" style={{ marginBottom: 20 }}>
          <button
            type="button"
            className={`seg-option ${direction === "savings_to_expenditure" ? "active" : ""}`}
            onClick={() => {
              setDirection("savings_to_expenditure");
              setAmount("");
            }}
            style={{ padding: "10px 12px", fontSize: "0.8125rem" }}
          >
            Savings → Expenditure
          </button>
          <button
            type="button"
            className={`seg-option ${direction === "expenditure_to_savings" ? "active" : ""}`}
            onClick={() => {
              setDirection("expenditure_to_savings");
              setAmount("");
            }}
            style={{ padding: "10px 12px", fontSize: "0.8125rem" }}
          >
            Expenditure → Savings
          </button>
        </div>

        {/* Source balance info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface)",
            border: "var(--glass-border)",
            boxShadow: "var(--glass-shadow)",
            borderRadius: "var(--r-lg)",
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {direction === "savings_to_expenditure"
                ? "Savings account balance"
                : "Expenditure account balance"}
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "1.375rem",
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              {formatINR(currentSourceBalance)}
            </div>
          </div>
          {parsedAmt > 0 && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                After transfer
              </div>
              <div
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "1.375rem",
                  color:
                    afterSourceBalance < 0 ? "var(--debit)" : "var(--text)",
                  letterSpacing: "-0.02em",
                }}
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,0,0,0.05)",
                borderRadius: "var(--r-lg)",
                padding: "4px 16px",
                border: `2px solid ${parsedAmt > 0 ? "rgba(217,119,87,0.30)" : "transparent"}`,
                transition: "border-color 0.2s",
              }}
            >
              <span
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "1.75rem",
                  color: "var(--text-muted)",
                  lineHeight: 1,
                  paddingBottom: 2,
                  flexShrink: 0,
                }}
              >
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
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: parsedAmt > 0 ? "var(--accent)" : "var(--text-muted)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  padding: "10px 0",
                  width: "100%",
                }}
              />
            </div>
            {/* Quick Topup Presets */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
                overflowX: "auto",
                paddingBottom: 4,
                width: "100%",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
            >
              {[100, 500, 1000, 2000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  style={{
                    flexShrink: 0,
                    padding: "8px 14px",
                    borderRadius: "var(--r-pill)",
                    background:
                      parsedAmt === val ? "var(--accent)" : "var(--border)",
                    border: "1px solid transparent",
                    color: parsedAmt === val ? "#fff" : "var(--text-secondary)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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
            className="btn-primary"
            style={{ width: "100%", marginTop: 8 }}
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
  savingsBalance: _savingsBalance,
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
