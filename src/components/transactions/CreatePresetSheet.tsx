/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, PiggyBank } from "lucide-react";
import { db, addPreset, updatePreset } from "../../db/database";
import { useAccount } from "../../db/hooks";
import { useCategories } from "../../hooks/useCategories";
import { updateSheetOpenState } from "../../utils/modalHelper";
import toast from "react-hot-toast";

interface CreatePresetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  presetToEdit?: { id?: number; description: string; amount: number; category: string; isCustom: boolean } | null;
}

export function CreatePresetSheet({ isOpen, onClose, presetToEdit }: CreatePresetSheetProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [accountType, setAccountType] = useState<"expenditure" | "savings">("expenditure");
  const [saving, setSaving] = useState(false);

  const expendAcc = useAccount("expenditure");
  const savingsAcc = useAccount("savings");
  const categories = useCategories();

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
            setAccountType(p.accountId === savingsAcc?.id ? "savings" : "expenditure");
          }
        });
      }
    } else {
      setName("");
      setAmount("");
      setCategory("");
      setAccountType("expenditure");
    }
  }, [presetToEdit, isOpen, savingsAcc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) return;

    const accountId = accountType === "expenditure" ? expendAcc?.id : savingsAcc?.id;
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
      setAccountType("expenditure");
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
            <label className="label" htmlFor="preset-name">Name</label>
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
            <label className="label" htmlFor="preset-amount">Amount</label>
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
                    onClick={() => setCategory(category === c.name ? "" : c.name)}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Account */}
          <div className="form-group m-0">
            <span className="label">Account</span>
            <div className="flex gap-2.5">
              <button
                type="button"
                className={`chip flex-1 py-3 px-4 rounded-(--r-md) text-sm flex items-center justify-center gap-2 ${
                  accountType === "expenditure" ? "chip-active" : ""
                }`}
                onClick={() => setAccountType("expenditure")}
              >
                <CreditCard size={16} /> Expenditure
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
            {saving ? "Saving…" : presetToEdit ? "Save Changes" : "Create Preset"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
