import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { addCategory, deleteCategory, db } from "../db/database";
import { useConfirm } from "../hooks/useConfirm";
import toast from "react-hot-toast";

export function ManageCategoriesPage() {
  const navigate = useNavigate();
  const rawCategories = useCategories();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  // Deduplicate categories by name (case-insensitive) for UI display
  const categories = useMemo(() => {
    const unique = new Map();
    for (const cat of rawCategories) {
      const key = cat.name.toLowerCase().trim();
      if (!unique.has(key)) {
        unique.set(key, cat);
      }
    }
    return Array.from(unique.values());
  }, [rawCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === newName.trim().toLowerCase(),
    );
    if (isDuplicate) {
      toast.error("A category with this name already exists");
      return;
    }

    setSaving(true);
    try {
      await addCategory({
        name: newName.trim(),
        color: "#9d9d99", // Default neutral color since UI picker is removed
        isCustom: true,
      });
      toast.success("Category created");
      setNewName("");
      setShowForm(false);
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const txCount = await db.transactions
      .filter((t) => t.category === name)
      .count();

    const warningMsg =
      txCount > 0
        ? `"${name}" is used in ${txCount} transaction${txCount > 1 ? "s" : ""}. Deleting it won't affect those transactions. Continue?`
        : `Are you sure you want to delete the "${name}" category?`;

    const confirmed = await confirm({
      title: "Delete Category",
      message: warningMsg,
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (confirmed) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted");
      } catch {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <>
      <div className="sub-header p-0! fade-in-up flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            className="p-0 min-h-0 h-auto flex text-(--text-muted) cursor-pointer hover:text-(--text) transition-colors"
            onClick={() => navigate(-1)}
            title="Back"
            id="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="sub-header-title m-0">Categories</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-1.5 h-8 px-3 text-xs cursor-pointer shadow-sm"
          id="btn-create-category"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Create"}
        </button>
      </div>

      <div className="glass-card p-4 mb-4 bg-(--accent)/5 border-(--accent)/20 fade-in-up">
        <p className="font-sans text-xs text-(--text-secondary) leading-relaxed m-0">
          <strong>Note:</strong> These are all the categories available for logging transactions. 
          You can create or delete custom categories here at any time.
        </p>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card fade-in-up p-5 mb-4 flex flex-col gap-4"
        >
          <div className="form-group m-0">
            <label className="label" htmlFor="cat-name">Category Name</label>
            <input
              id="cat-name"
              type="text"
              placeholder="e.g. Subscriptions"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 mt-1"
            disabled={saving || !newName.trim()}
          >
            {saving ? "Creating…" : "Create Category"}
          </button>
        </form>
      )}

      {/* Minimal Category List */}
      <div className="flex flex-col gap-1.5 fade-in-up delay-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 group"
          >
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm font-medium text-(--text)">
                {cat.name}
              </span>
              {cat.isCustom && (
                <span className="text-[9px] font-semibold tracking-wider uppercase text-(--text-muted) px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10">
                  Custom
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(cat.id!, cat.name)}
              className="p-1.5 text-(--text-muted) opacity-50 hover:opacity-100 hover:text-(--debit) hover:bg-red-500/10 rounded-md cursor-pointer transition-all"
              title={`Delete ${cat.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {confirmDialog}
    </>
  );
}
