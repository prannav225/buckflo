import React from "react";
import { Check } from "lucide-react";
import { CustomDatePicker } from "../../CustomDatePicker";
import { hapticFeedback } from "../../../utils/haptics";

interface Category {
  id?: number;
  name: string;
}


interface TransactionDetailsCardProps {
  description: string;
  setDescription: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: Category[];
  date: string;
  setDate: (val: string) => void;
  isAddingCategory: boolean;
  setIsAddingCategory: (val: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (val: string) => void;
  handleSaveNewCategory: () => void;
  categoryInputRef: React.RefObject<HTMLInputElement>;
}

export function TransactionDetailsCard({
  description,
  setDescription,
  category,
  setCategory,
  categories,
  date,
  setDate,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  handleSaveNewCategory,
  categoryInputRef,
}: TransactionDetailsCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="form-group m-0">
        <label className="label" htmlFor="page-tx-desc">
          Description
        </label>
        <input
          id="page-tx-desc"
          type="text"
          placeholder="What was this transaction for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          required
        />
      </div>



      <div className="form-group m-0">
        <span className="label">
          Category <span className="font-normal opacity-60">— optional</span>
        </span>
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
                onClick={() => {
                  hapticFeedback.light();
                  setCategory(category === c.name ? "" : c.name);
                }}
                id={`page-cat-${c.name.toLowerCase()}`}
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

      <div className="form-group m-0">
        <label className="label" htmlFor="page-tx-date">
          Date
        </label>
        <CustomDatePicker
          id="page-tx-date"
          value={date}
          onChange={setDate}
        />
      </div>
    </div>
  );
}
