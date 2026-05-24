import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { addSubscription, updateSubscription, type Subscription } from "../../db/database";
import { CATEGORIES } from "../../utils/categories";

interface Props {
  showFormModal: boolean;
  setShowFormModal: (v: boolean) => void;
  editingSub: Subscription | null;
}

export function SubscriptionFormSheet({ showFormModal, setShowFormModal, editingSub }: Props) {
  // Form states
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [formDueDate, setFormDueDate] = useState("");
  const [formCategory, setFormCategory] = useState("Bills");
  const [formStatus, setFormStatus] = useState<
    "active" | "cancelled" | "paused"
  >("active");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    if (editingSub) {
      setFormName(editingSub.name);
      setFormAmount(editingSub.amount.toString());
      setFormFrequency(editingSub.frequency);
      setFormDueDate(editingSub.nextDueDate);
      setFormCategory(editingSub.category);
      setFormStatus(editingSub.status);
      setFormNotes(editingSub.notes || "");
    } else {
      setFormName("");
      setFormAmount("");
      setFormFrequency("monthly");
      // Default to today
      setFormDueDate(new Date().toISOString().split("T")[0]);
      setFormCategory("Bills");
      setFormStatus("active");
      setFormNotes("");
    }
  }, [editingSub, showFormModal]);

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
      onClick={(e) =>
        e.target === e.currentTarget && setShowFormModal(false)
      }
    >
      <div
        className="sheet-panel"
        style={{
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1.25rem",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {editingSub ? "Edit Subscription" : "New Subscription"}
            </h3>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              Set up committed recurring expenditures
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => setShowFormModal(false)}
            style={{ padding: 8, borderRadius: "50%" }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
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
            <div className="form-group" style={{ flex: 1.2 }}>
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
            <div className="form-group" style={{ flex: 1 }}>
              <span className="label">Frequency</span>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value as any)}
                className="input-field"
                style={{
                  background: "var(--bg-glass)",
                  height: 48,
                  padding: "0 16px",
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Next Due Date & Category */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1.2 }}>
              <span className="label">Next Due Date</span>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <span className="label">Category</span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="input-field"
                style={{
                  background: "var(--bg-glass)",
                  height: 48,
                  padding: "0 16px",
                }}
              >
                {CATEGORIES.filter((c) => c !== "Transfer").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="form-group">
            <span className="label">Status</span>
            <div className="seg-control" style={{ padding: 3, gap: 3 }}>
              {(["active", "paused", "cancelled"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormStatus(st)}
                  className={`seg-option ${formStatus === st ? "active" : ""}`}
                  style={{
                    padding: "6px 10px",
                    fontSize: "0.75rem",
                    borderRadius: "var(--r-pill)",
                    boxShadow: formStatus === st ? undefined : "none",
                  }}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
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

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: 12 }}
          >
            {editingSub ? "Save Changes" : "Create Subscription"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
