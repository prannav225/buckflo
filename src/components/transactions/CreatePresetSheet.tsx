/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, PiggyBank, Check } from "lucide-react";
import { db, addPreset, updatePreset, addCategory } from "../../db/database";
import { useAccount } from "../../db/hooks";
import { useCategories } from "../../hooks/useCategories";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { useBackHandler } from "../../hooks/useBackHandler";
import toast from "react-hot-toast";

interface CreatePresetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  presetToEdit?: {
    id?: number;
    description: string;
    amount: number;
    category: string;
    isCustom: boolean;
  } | null;
}

export function CreatePresetSheet({
  isOpen,
  onClose,
  presetToEdit,
}: CreatePresetSheetProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  useBackHandler(isOpen, onClose);
  const [category, setCategory] = useState("");
  const [accountType, setAccountType] = useState<"spending" | "savings">(
    "spending",
  );
  const [saving, setSaving] = useState(false);

  const spendingAcc = useAccount("spending");
  const savingsAcc = useAccount("savings");
  const categories = useCategories();

  // Category creator states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNewCategory = async () => {
    const name = newCategoryName.trim();
    if (name) {
      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
      );
      if (isDuplicate) {
        toast.error("Category already exists");
        return;
      }
      try {
        await addCategory({
          name,
          color: "#d97757",
          isCustom: true,
        });
        setCategory(name);
      } catch {
        toast.error("Failed to create category");
      }
    }
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen]);

  useEffect(() => {
    if (presetToEdit) {
      setName(presetToEdit.description);
      setAmount(presetToEdit.amount.toString());
      setCategory(presetToEdit.category);
      if (presetToEdit.id !== undefined) {
        db.presets.get(presetToEdit.id).then((p) => {
          if (p) {
            setAccountType(
              p.accountId === savingsAcc?.id ? "savings" : "spending",
            );
          }
        });
      }
    } else {
      setName("");
      setAmount("");
      setCategory("");
      setAccountType("spending");
    }
  }, [presetToEdit, isOpen, savingsAcc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;

    const accountId =
      accountType === "spending" ? spendingAcc?.id : savingsAcc?.id;
    if (!accountId) {
      toast.error("Account not initialized yet");
      return;
    }

    setSaving(true);
    try {
      if (presetToEdit && presetToEdit.id !== undefined) {
        await updatePreset(presetToEdit.id, {
          name: name.trim(),
          amount: parseFloat(amount),
          category: category || "Other",
          accountId,
        });
        toast.success("Preset updated");
      } else {
        await addPreset({
          name: name.trim(),
          amount: parseFloat(amount),
          category: category || "Other",
          accountId,
          isCustom: true,
          usageCount: 0,
        });
        toast.success("Preset created");
      }
      setName("");
      setAmount("");
      setCategory("");
      setAccountType("spending");
      onClose();
    } catch {
      toast.error("Failed to save preset");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-(--text) m-0">
            {presetToEdit ? "Edit Preset" : "Create Preset"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1.5 min-h-0 h-auto rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="form-group m-0">
            <label className="label" htmlFor="preset-name">
              Name
            </label>
            <input
              id="preset-name"
              type="text"
              placeholder="e.g. Coffee, Metro Fare"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Amount */}
          <div className="form-group m-0">
            <label className="label" htmlFor="preset-amount">
              Amount
            </label>
            <input
              id="preset-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group m-0">
            <span className="label">Category</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories
                .filter((c) => c.name !== "Transfer" && c.name !== "transfer")
                .map((c) => (
                  <button
                    key={c.id ?? c.name}
                    type="button"
                    className={`chip py-2 px-4 text-[0.8125rem] ${
                      category === c.name ? "chip-active" : ""
                    }`}
                    onClick={() =>
                      setCategory(category === c.name ? "" : c.name)
                    }
                  >
                    {c.name}
                  </button>
                ))}

              {isAddingCategory ? (
                <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full pl-3 pr-1 py-1 border border-black/10 dark:border-white/10">
                  <input
                    ref={categoryInputRef}
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Name..."
                    className="bg-transparent border-none outline-none text-[0.8125rem] text-(--text) w-20 p-0 m-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveNewCategory();
                      } else if (e.key === "Escape") {
                        setIsAddingCategory(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewCategory}
                    className="w-6 h-6 flex items-center justify-center bg-(--accent) text-white rounded-full transition-transform active:scale-90 cursor-pointer"
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="chip py-2 px-4 text-[0.8125rem] border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 bg-transparent cursor-pointer"
                  onClick={() => {
                    setIsAddingCategory(true);
                    setTimeout(() => categoryInputRef.current?.focus(), 50);
                  }}
                >
                  + New
                </button>
              )}
            </div>
          </div>

          {/* Account */}
          <div className="form-group m-0">
            <span className="label">Account</span>
            <div className="flex gap-2.5">
              <button
                type="button"
                className={`chip flex-1 py-3 px-4 rounded-(--r-md) text-sm flex items-center justify-center gap-2 ${
                  accountType === "spending" ? "chip-active" : ""
                }`}
                onClick={() => setAccountType("spending")}
              >
                <CreditCard size={16} /> Spending
              </button>
              <button
                type="button"
                className={`chip flex-1 py-3 px-4 rounded-(--r-md) text-sm flex items-center justify-center gap-2 ${
                  accountType === "savings" ? "chip-active-green" : ""
                }`}
                onClick={() => setAccountType("savings")}
              >
                <PiggyBank size={16} /> Savings
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full py-3.5 mt-2"
            disabled={saving || !name.trim() || !amount.trim()}
          >
            {saving
              ? "Saving…"
              : presetToEdit
                ? "Save Changes"
                : "Create Preset"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
