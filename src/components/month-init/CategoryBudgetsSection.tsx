import React from "react";
import { Wallet, ChevronDown, X, Check } from "lucide-react";
import { addCategory } from "../../db/database";
import toast from "react-hot-toast";

interface CategoryBudgetsSectionProps {
  showCatBudgets: boolean;
  setShowCatBudgets: React.Dispatch<React.SetStateAction<boolean>>;
  budgetableCategories: string[];
  catBudgets: Record<string, string>;
  setCatBudgets: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleBlur: (val: string, setter: (val: string) => void) => void;
}

export function CategoryBudgetsSection({
  showCatBudgets,
  setShowCatBudgets,
  budgetableCategories,
  catBudgets,
  setCatBudgets,
  handleBlur,
}: CategoryBudgetsSectionProps) {
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const categoryInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveNewCategory = async () => {
    const name = newCategoryName.trim();
    if (name) {
      const isDuplicate = budgetableCategories.some(
        (cat) => cat.toLowerCase() === name.toLowerCase(),
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
        setCatBudgets((prev) => ({
          ...prev,
          [name]: "",
        }));
        toast.success("Category created and added to budgets");
      } catch (err) {
        toast.error("Failed to create category");
      }
    }
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  const activeCategories = budgetableCategories.filter(
    (cat) => catBudgets[cat] !== undefined && catBudgets[cat] !== "0"
  );
  const inactiveCategories = budgetableCategories.filter(
    (cat) => catBudgets[cat] === undefined || catBudgets[cat] === "0"
  );

  return (
    <>
      <div className="divider my-4.5" />
      <div
        className={`flex items-center justify-between cursor-pointer ${
          showCatBudgets ? "mb-3.5" : "mb-0"
        } select-none`}
        onClick={() => setShowCatBudgets((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && setShowCatBudgets((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 rounded-[9px] bg-[rgba(217,119,87,0.12)] flex items-center justify-center">
            <Wallet size={15} className="text-(--accent)" />
          </div>
          <span className="font-sans text-sm font-semibold tracking-tight">
            Category Budgets{" "}
            <span className="font-normal opacity-60 text-[0.8125rem]">
              — optional
            </span>
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-(--text-muted) transition-transform duration-200 ${
            showCatBudgets ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {showCatBudgets && (
        <div className="flex flex-col gap-4 mb-3">
          {activeCategories.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
                Active Budgets ({activeCategories.length})
              </div>
              {activeCategories.map((cat) => (
                <div key={cat} className="flex items-center gap-2.5 bg-black/2 dark:bg-white/2 p-2 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="font-sans text-[0.8125rem] font-medium text-(--text) min-w-[90px] shrink-0 pl-1">
                    {cat}
                  </span>
                  <div className="flex-1 flex items-center gap-1 bg-(--bg-surface) rounded-(--r-md) px-2.5 border border-black/8 dark:border-white/6">
                    <span className="text-[0.8125rem] text-(--text-muted) font-medium">
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter limit"
                      value={catBudgets[cat] || ""}
                      onChange={(e) =>
                        setCatBudgets((prev) => ({
                          ...prev,
                          [cat]: e.target.value,
                        }))
                      }
                      onBlur={() => {
                        const val = catBudgets[cat];
                        if (val)
                          handleBlur(val, (v) =>
                            setCatBudgets((prev) => ({ ...prev, [cat]: v })),
                          );
                      }}
                      className="border-none bg-transparent outline-none font-sans text-sm font-semibold text-(--text) py-2 w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCatBudgets((prev) => ({
                        ...prev,
                        [cat]: "0",
                      }));
                    }}
                    className="btn-ghost p-1.5 min-h-0 h-auto rounded-full text-(--text-muted) hover:text-(--debit) cursor-pointer"
                    title="Remove budget"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
              {activeCategories.length > 0 ? "Add budget for other categories" : "Select categories to budget"}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {inactiveCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCatBudgets((prev) => ({
                      ...prev,
                      [cat]: "",
                    }));
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/4 text-(--text-secondary) hover:text-(--text) hover:bg-black/5 dark:hover:bg-white/6 hover:border-black/15 cursor-pointer transition-all flex items-center gap-1 select-none"
                >
                  <span>+</span> {cat}
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
                    className="bg-transparent border-none outline-none text-xs text-(--text) w-20 p-0 m-0"
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
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-dashed border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 bg-transparent text-(--text-secondary) hover:text-(--text) cursor-pointer transition-all flex items-center gap-1 select-none"
                  onClick={() => {
                    setIsAddingCategory(true);
                    setTimeout(() => categoryInputRef.current?.focus(), 50);
                  }}
                >
                  + New
                </button>
              )}

              {inactiveCategories.length === 0 && !isAddingCategory && (
                <span className="text-xs text-(--text-muted) italic">All categories have budgets set.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
