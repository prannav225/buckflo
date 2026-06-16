import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import {
  addSubscription,
  updateSubscription,
  addCategory,
  type Subscription,
} from "../../db/database";
import { useCategories } from "../../hooks/useCategories";
import { SegmentedControl } from "../ui/SegmentedControl";
import { useBackHandler } from "../../hooks/useBackHandler";
import { CustomDropdown, type DropdownOption } from "../layout/CustomDropdown";
import { CustomDatePicker } from "../CustomDatePicker";
import { CurrencyInput } from "../ui/CurrencyInput";

const frequencyOptions: DropdownOption<
  "weekly" | "monthly" | "3_months" | "6_months" | "yearly"
>[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "3_months", label: "3 Months" },
  { value: "6_months", label: "6 Months" },
  { value: "yearly", label: "Yearly" },
];

interface Props {
  showFormModal: boolean;
  setShowFormModal: (v: boolean) => void;
  editingSub: Subscription | null;
}

export function SubscriptionFormSheet({
  showFormModal,
  setShowFormModal,
  editingSub,
}: Props) {
  const categories = useCategories();

  useBackHandler(showFormModal, () => setShowFormModal(false));

  // Form states
  const [formName, setFormName] = useState(editingSub ? editingSub.name : "");
  const [formAmount, setFormAmount] = useState(
    editingSub ? editingSub.amount.toString() : "",
  );
  const [formFrequency, setFormFrequency] = useState<
    "weekly" | "monthly" | "3_months" | "6_months" | "yearly"
  >(editingSub ? editingSub.frequency : "monthly");
  const [formDueDate, setFormDueDate] = useState(
    editingSub
      ? editingSub.nextDueDate
      : new Date().toISOString().split("T")[0],
  );
  const [formCategory, setFormCategory] = useState(
    editingSub ? editingSub.category : "Bills",
  );
  const [formStatus, setFormStatus] = useState<
    "active" | "cancelled" | "paused"
  >(editingSub ? editingSub.status : "active");
  const [formNotes, setFormNotes] = useState(editingSub?.notes || "");

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
        setFormCategory(name);
      } catch {
        toast.error("Failed to create category");
      }
    }
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formDueDate) {
      toast.error("Please select a due date");
      return;
    }

    const subData: Omit<Subscription, "id"> = {
      name: formName.trim(),
      amount: amt,
      frequency: formFrequency,
      nextDueDate: formDueDate,
      category: formCategory,
      status: formStatus,
      autoDetected: false, // Manually added/edited are not drafts
      notes: formNotes.trim() || undefined,
    };

    try {
      if (editingSub?.id) {
        await updateSubscription(editingSub.id, subData);
        toast.success("Subscription updated successfully");
      } else {
        await addSubscription(subData);
        toast.success("Subscription added successfully");
      }
      setShowFormModal(false);
    } catch (err) {
      toast.error("Failed to save subscription");
      console.error(err);
    }
  };

  if (!showFormModal) return null;

  return createPortal(
    <div
      className="sheet-overlay"
      onClick={(e) => e.target === e.currentTarget && setShowFormModal(false)}
    >
      <div className="sheet-panel pb-[calc(24px+env(safe-area-inset-bottom,0))]">
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl tracking-[-0.02em] m-0">
              {editingSub ? "Edit Subscription" : "New Subscription"}
            </h3>
            <p className="mt-[3px] text-xs text-(--text-muted)">
              Set up subscriptions or services
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={() => setShowFormModal(false)}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div className="form-group">
            <span className="label">Name / Description</span>
            <input
              type="text"
              placeholder="e.g. Netflix, Rent, Gym"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Amount & Frequency */}
          <div className="form-row">
            <div className="form-group flex-[1.2]">
              <span className="label">Amount (₹)</span>
              <CurrencyInput
                placeholder="0.00"
                value={formAmount}
                onChange={(val) => setFormAmount(val)}
                className="input-field"
                required
              />
            </div>
            <div className="form-group flex-1 text-left">
              <span className="label">Frequency</span>
              <CustomDropdown
                options={frequencyOptions}
                value={formFrequency}
                onChange={(e) => setFormFrequency(e)}
                id="subscription-frequency"
                variant="form"
              />
            </div>
          </div>

          {/* Next Due Date */}
          <div className="form-group m-0!">
            <span className="label">Next Due Date</span>
            <CustomDatePicker
              id="subscription-due-date"
              value={formDueDate}
              onChange={setFormDueDate}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <span className="label">Category</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories
                .filter((c) => c.name !== "Transfer" && c.name !== "transfer")
                .map((c) => (
                  <button
                    key={c.id ?? c.name}
                    type="button"
                    className={`chip py-2 px-4 text-[0.8125rem] ${
                      formCategory === c.name ? "chip-active" : ""
                    }`}
                    onClick={() => setFormCategory(c.name)}
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

          {/* Status */}
          <div className="form-group">
            <span className="label">Status</span>
            <SegmentedControl
              options={["active", "paused", "cancelled"] as const}
              value={formStatus}
              onChange={(v) => setFormStatus(v)}
              idPrefix="status"
              className="max-w-[320px]"
            />
          </div>

          <div className="form-group">
            <span className="label">Notes — optional</span>
            <input
              type="text"
              placeholder="e.g. Shared with roommates"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-3">
            {editingSub ? "Save Changes" : "Create Subscription"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
