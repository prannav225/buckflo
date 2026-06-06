import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Check,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Upload,
} from "lucide-react";
import { useTransactionForm } from "../hooks/useTransactionForm";
import { useConfirm } from "../hooks/useConfirm";
import { formatINR } from "../utils/currency";
import { hapticFeedback } from "../utils/haptics";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { useCategories } from "../hooks/useCategories";
import { updateSheetOpenState } from "../utils/modalHelper";
import { ImportModal } from "../components/transactions/ImportModal";
import { db } from "../db/database";
import { TransactionAmountCard } from "../components/transactions/form/TransactionAmountCard";
import { TransactionDetailsCard } from "../components/transactions/form/TransactionDetailsCard";

export function AddEditTransaction() {
  const [showImport, setShowImport] = useState(false);
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
    category,
    setCategory,
    loading,
    fetching,
    isEdit,
    savingsAcc,
    handleSubmit,
    handleDelete,
  } = useTransactionForm();

  const categories = useCategories();
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNewCategory = async () => {
    const name = newCategoryName.trim();
    if (name) {
      await db.categories.add({
        name,
        color: "#d97757",
        isCustom: true,
        createdAt: Date.now(),
      });
      setCategory(name);
    }
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  if (fetching) {
    return createPortal(
      <div className="sheet-overlay animate-fade-in" onClick={handleBack}>
        <div
          className="sheet-panel pb-[calc(24px+env(safe-area-inset-bottom,0))] slide-up flex flex-col items-center justify-center min-h-[250px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sheet-handle" />
          <div className="w-8 h-8 border-3 border-(--border) border-t-(--accent) rounded-full animate-spin my-8" />
        </div>
      </div>,
      document.body
    );
  }

  const parsedAmt = parseFloat(amount) || 0;

  return createPortal(
    <div className="sheet-overlay animate-fade-in" onClick={handleBack}>
      <div
        className="sheet-panel pb-[calc(24px+env(safe-area-inset-bottom,0))] slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl tracking-[-0.02em] m-0">
              {isEdit ? "Edit Entry" : "Create Entry"}
            </h3>
            <p className="mt-[3px] text-xs text-(--text-muted)">
              {isEdit ? "Modify transaction details" : "Log a new transaction"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {!isEdit && (
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm text-[11px] font-semibold text-(--text) hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer uppercase tracking-wider"
                onClick={() => setShowImport(true)}
              >
                <Upload size={13} strokeWidth={2.5} /> IMPORT
              </button>
            )}
            {isEdit && (
              <button
                type="button"
                className="btn-ghost text-(--debit) p-2 rounded-full min-h-0 h-auto flex items-center justify-center"
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
                title="Delete entry"
                id="delete-entry-btn"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              className="btn-ghost p-2 rounded-full min-h-0 h-auto flex items-center justify-center cursor-pointer"
              onClick={handleBack}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            hapticFeedback.medium();
            handleSubmit(e);
          }}
          className="flex flex-col gap-3"
        >
          <SegmentedControl
            idPrefix="page-type"
            options={["debit", "credit"] as const}
            value={type}
            onChange={(val) => setType(val)}
            className="max-w-[320px] mx-auto mb-3"
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

          <TransactionAmountCard
            type={type}
            amount={amount}
            setAmount={setAmount}
            parsedAmt={parsedAmt}
            isEdit={isEdit}
            fetching={fetching}
          />

          <TransactionDetailsCard
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            categories={categories}
            date={date}
            setDate={setDate}
            isAddingCategory={isAddingCategory}
            setIsAddingCategory={setIsAddingCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            handleSaveNewCategory={handleSaveNewCategory}
            categoryInputRef={categoryInputRef as React.RefObject<HTMLInputElement>}
          />

          <div className="mt-1">
            <button
              type="submit"
              className={`btn-primary w-full py-3.5 px-7 rounded-(--r-pill) transition-[background,box-shadow,transform] duration-300 ease-in-out cursor-pointer ${
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
                    : `Create ${type === "debit" ? "Expense" : "Income"}`}
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

        {showImport && (
          <ImportModal
            isOpen={showImport}
            onClose={() => setShowImport(false)}
            onSuccess={() => {
              setShowImport(false);
              navigate("/", { replace: true });
            }}
            activeTab={accountId === savingsAcc?.id ? "savings" : "spending"}
          />
        )}
      </div>
      {confirmDialog}
    </div>,
    document.body
  );
}
