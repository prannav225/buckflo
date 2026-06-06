import { useState, useMemo } from "react";
import { Plus, X, Edit2 } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import {
  addCategory,
  deleteCategory,
  updateCategory,
  db,
} from "../db/database";
import { useConfirm } from "../hooks/useConfirm";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { updateSheetOpenState } from "../utils/modalHelper";

export function ManageCategoriesPage() {
  const rawCategories = useCategories();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    updateSheetOpenState();
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isSheetOpen]);

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

  const openCreateSheet = () => {
    setEditingCategory(null);
    setNewName("");
    setIsSheetOpen(true);
  };

  const openEditSheet = (cat: any) => {
    setEditingCategory(cat);
    setNewName(cat.name);
    setIsSheetOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === newName.trim().toLowerCase() &&
        c.id !== editingCategory?.id,
    );
    if (isDuplicate) {
      toast.error("A category with this name already exists");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Editing existing category
        const oldName = editingCategory.name;
        const newCatName = newName.trim();

        await updateCategory(editingCategory.id!, { name: newCatName });

        // Update any existing transactions that used the old category name
        if (oldName !== newCatName) {
          await db.transactions
            .where("category")
            .equals(oldName)
            .modify((t) => {
              t.category = newCatName;
            });
        }
        toast.success("Category updated");
      } else {
        // Creating new
        await addCategory({
          name: newName.trim(),
          color: "#9d9d99", // Default neutral color
          isCustom: true,
        });
        toast.success("Category created");
      }
      setNewName("");
      setIsSheetOpen(false);
    } catch {
      toast.error(editingCategory ? "Failed to update" : "Failed to create");
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
        setIsSheetOpen(false);
      } catch {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <>
      {/* Sticky Header Section */}
      <div className="sticky top-[calc(56px+env(safe-area-inset-top,0))] z-40 pb-1 pt-6 -mx-4 px-4 -mt-4 bg-(--bg)/90 [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)]">
        <div className="glass-card p-4 mb-3 bg-(--accent)/5 border-(--accent)/20 fade-in-up">
          <p className="font-sans text-[13px] text-(--text-secondary) leading-relaxed m-0">
            <strong>Note:</strong> These are all the categories available for
            logging transactions. You can create, edit, or delete custom
            categories here at any time.
          </p>
        </div>
        <div className="pb-3 text-right">
          <button
            onClick={openCreateSheet}
            className="btn-primary h-7 px-3 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
            aria-label="Create Category"
          >
            <Plus size={14} /> Create
          </button>
        </div>
      </div>
      {/* Grid Category List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 fade-in-up delay-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => openEditSheet(cat)}
            className="relative flex flex-col items-center justify-center p-4 bg-black/3 dark:bg-white/4 border border-black/5 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all group overflow-hidden"
          >
            <div className="font-sans text-[14px] font-semibold text-(--text) text-center line-clamp-1 w-full truncate">
              {cat.name}
            </div>
            {cat.isCustom ? (
              <div className="mt-2 text-[9px] font-bold tracking-wider uppercase text-(--accent) px-2 py-0.5 rounded border border-(--accent)/20 bg-(--accent)/5">
                Custom
              </div>
            ) : (
              <div className="mt-2 text-[9px] font-bold tracking-wider uppercase text-(--text-muted) px-2 py-0.5 rounded border border-transparent">
                Default
              </div>
            )}

            {/* Hover Edit Overlay */}
            <div className="absolute inset-0 bg-(--bg-glass-strong) flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-(--text)">
                <Edit2 size={14} /> Edit
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Editor Bottom Sheet */}
      {isSheetOpen &&
        createPortal(
          <div
            className="sheet-overlay z-9999"
            onClick={() => setIsSheetOpen(false)}
          >
            <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight m-0 text-(--text)">
                    {editingCategory ? "Manage Category" : "New Category"}
                  </h2>
                  <p className="m-[3px_0_0] text-[0.8125rem] text-(--text-muted) font-sans">
                    {editingCategory
                      ? "Update or delete this category"
                      : "Add a custom tracking category"}
                  </p>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="btn-ghost p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSaveCategory}
                className="flex flex-col gap-5"
              >
                <div className="form-group m-0">
                  <span className="label">Category Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Subscriptions"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field"
                    required
                    autoFocus
                    disabled={editingCategory && !editingCategory.isCustom}
                  />
                  {editingCategory && !editingCategory.isCustom && (
                    <p className="text-[10px] text-(--text-muted) mt-1.5 mb-0">
                      Default categories cannot be renamed.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-1">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(editingCategory.id!, editingCategory.name)
                      }
                      className="flex-1 rounded-[999px] border border-red-500/20 bg-red-500/10 text-(--debit) font-semibold text-[0.9375rem] transition-all hover:bg-red-500/20 active:scale-95 py-3"
                    >
                      Delete
                    </button>
                  )}
                  {(!editingCategory || editingCategory.isCustom) && (
                    <button
                      type="submit"
                      className="flex-[1.25] btn-primary py-3! px-2!"
                      disabled={
                        saving ||
                        !newName.trim() ||
                        (editingCategory &&
                          newName.trim() === editingCategory.name)
                      }
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {confirmDialog}
    </>
  );
}
