import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import { updateSheetOpenState } from "../utils/modalHelper";

// ─── Shared Types (imported by useConfirm.ts) ─────────────────────────────────

export interface ConfirmOptions {
  title: string;
  message: string;
  /** Label for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Visual variant for the confirm button. Defaults to "danger". */
  variant?: "danger" | "default";
}

export interface DialogState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// ─── ConfirmDialog UI Component ───────────────────────────────────────────────

interface ConfirmDialogProps {
  state: DialogState | null;
  onClose: () => void;
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Handle active overlay body class for inactive background visual dimming
  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [state]);

  // Focus Cancel on open for accessibility
  useEffect(() => {
    if (state) {
      const t = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Escape to cancel
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        state.resolve(false);
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [state, onClose]);

  if (!state) return null;

  const isDanger = state.variant !== "default";

  const handleConfirm = () => {
    state.resolve(true);
    onClose();
  };

  const handleCancel = () => {
    state.resolve(false);
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={handleBackdrop}
      className="fixed inset-0 bg-[#0a0908]/55 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)] z-500 flex items-center justify-center p-6 animate-fade-in"
    >
      <div className="glass-card-strong pop-in w-full max-w-[340px] bg-(--bg-surface) border border-black/8 dark:border-white/6 rounded-(--r-xl) shadow-(--glass-shadow-lg) p-6 flex flex-col gap-4">
        {/* Icon + Title */}
        <div className="flex items-start gap-3.5">
          <div
            className={`shrink-0 w-10 h-10 rounded-(--r-md) flex items-center justify-center ${
              isDanger
                ? "bg-[rgba(224,85,69,0.1)]"
                : "bg-[rgba(217,119,87,0.1)]"
            }`}
          >
            {isDanger ? (
              <Trash2 size={20} className="text-(--debit)" />
            ) : (
              <AlertTriangle size={20} className="text-(--accent)" />
            )}
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="font-sans text-base font-bold tracking-tight text-(--text) m-0"
            >
              {state.title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="font-sans text-sm text-(--text-secondary) mt-1.5 leading-normal"
            >
              {state.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3 px-4 rounded-(--r-pill) border-[1.5px] border-(--border) bg-transparent text-(--text-secondary) font-sans text-[0.9375rem] font-semibold cursor-pointer active:bg-black/5 dark:active:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-(--r-pill) border-none text-white font-sans text-[0.9375rem] font-semibold cursor-pointer transition-opacity active:opacity-90 ${
              isDanger ? "bg-(--debit)" : "bg-(--accent)"
            }`}
          >
            {state.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
