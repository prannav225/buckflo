import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, X, Palette } from "lucide-react";
import { useCategories, hexToRgba } from "../hooks/useCategories";
import { addCategory, deleteCategory, db } from "../db/database";
import { useConfirm } from "../hooks/useConfirm";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  "#d97757", "#40a0c0", "#e0a045", "#9060b0", "#5a9e6f",
  "#b04060", "#a0a860", "#e06070", "#5080d0", "#d0a070",
  "#60b0a0", "#c06090",
];

export function ManageCategoriesPage() {
  const navigate = useNavigate();
  const categories = useCategories();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Check for duplicate name
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
        color: newColor,
        isCustom: true,
      });
      toast.success("Category created");
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setShowForm(false);
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    // Check if any transactions reference this category
    const txCount = await db.transactions
      .filter((t) => t.category === name)
      .count();

    const warningMsg =
      txCount > 0
        ? `"${name}" is used in ${txCount} transaction${txCount > 1 ? "s" : ""}. Deleting it won't affect those transactions, but they'll no longer show a category colour. Continue?`
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
            className="p-0 min-h-0 h-auto flex text-(--text-muted)"
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
          className="btn-ghost flex items-center gap-1.5 text-(--accent) font-semibold"
          id="btn-create-category"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "Create"}
        </button>
      </div>

      <div className="glass-card p-4 mb-4 bg-(--accent)/5 border-(--accent)/20 fade-in-up">
        <p className="font-sans text-xs text-(--text-secondary) leading-relaxed m-0">
          <strong>Note:</strong> These are all the categories available for logging transactions. 
          The categories you select in the Setup Wizard are your "Watched" categories, which are highlighted 
          in your monthly insights. You can add or delete categories here at any time.
        </p>
      </div>

      {/* Create Category Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card fade-in-up p-5 mb-4 flex flex-col gap-4"
        >
          {/* Name */}
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

          {/* Colour Palette */}
          <div className="form-group m-0">
            <span className="label">Colour</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 transition-all duration-150 cursor-pointer shrink-0"
                  style={{
                    backgroundColor: color,
                    borderColor: newColor === color ? "white" : "transparent",
                    boxShadow:
                      newColor === color
                        ? `0 0 0 2px ${color}, 0 2px 8px rgba(0,0,0,0.2)`
                        : "none",
                    transform: newColor === color ? "scale(1.1)" : "scale(1)",
                  }}
                  onClick={() => setNewColor(color)}
                />
              ))}
              <div
                className="w-8 h-8 rounded-full border-2 transition-all duration-150 relative overflow-hidden shrink-0 cursor-pointer flex items-center justify-center bg-(--bg-surface)"
                style={{
                  borderColor: !PRESET_COLORS.includes(newColor) ? "white" : "var(--border)",
                  boxShadow: !PRESET_COLORS.includes(newColor)
                    ? `0 0 0 2px ${newColor}, 0 2px 8px rgba(0,0,0,0.2)`
                    : "none",
                  transform: !PRESET_COLORS.includes(newColor) ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Palette size={14} className="text-(--text-secondary)" />
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0"
                  title="Choose custom color"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-(--r-md) bg-(--bg-glass)">
            <span className="text-sm font-medium text-(--text)">
              {newName.trim() || "Category Name"}
            </span>
            <span
              className="ml-auto inline-flex items-center rounded-(--r-pill) px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: hexToRgba(newColor, 0.12),
                color: newColor,
              }}
            >
              Preview
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={saving || !newName.trim()}
          >
            {saving ? "Creating…" : "Create Category"}
          </button>
        </form>
      )}

      {/* Category List */}
      <div className="flex flex-col gap-2 fade-in-up delay-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-sans text-[0.9375rem] font-medium text-(--text)">
                  {cat.name}
                </div>
                <div className="font-sans text-[11px] text-(--text-muted) mt-0.5">
                  {cat.isCustom ? "Custom" : "Default"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <button
                onClick={() => handleDelete(cat.id!, cat.name)}
                className="btn-ghost p-1.5 min-h-0 h-auto text-(--text-muted) hover:text-(--debit) rounded-full cursor-pointer"
                title={`Delete ${cat.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDialog}
    </>
  );
}
