import { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  addSubscription,
  updateSubscription,
  type Subscription,
} from "../../db/database";
import { CATEGORIES } from "../../utils/categories";
import { SegmentedControl } from "../ui/SegmentedControl";

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
  // Form states
  const [formName, setFormName] = useState(editingSub ? editingSub.name : "");
  const [formAmount, setFormAmount] = useState(
    editingSub ? editingSub.amount.toString() : "",
  );
  const [formFrequency, setFormFrequency] = useState<
    "weekly" | "monthly" | "yearly"
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
        toast.success("Subscription updated successfully ✓");
      } else {
        await addSubscription(subData);
        toast.success("Subscription added successfully ✓");
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
              Set up committed recurring expenditures
            </p>
          </div>
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={() => setShowFormModal(false)}
          >
            ✕
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
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="form-group flex-1">
              <span className="label">Frequency</span>
              <select
                value={formFrequency}
                onChange={(e) =>
                  setFormFrequency(
                    e.target.value as "weekly" | "monthly" | "yearly",
                  )
                }
                className="input-field bg-(--bg-glass) h-12 px-4"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Next Due Date & Category */}
          <div className="form-row">
            <div className="form-group flex-[1.2]">
              <span className="label">Next Due Date</span>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="form-group flex-1">
              <span className="label">Category</span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="input-field bg-(--bg-glass) h-12 px-4"
              >
                {CATEGORIES.filter((c) => c !== "Transfer").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <span className="label">Status</span>
            <SegmentedControl
              options={["active", "paused", "cancelled"] as const}
              value={formStatus}
              onChange={setFormStatus}
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
