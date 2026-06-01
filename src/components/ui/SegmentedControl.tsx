import type { ReactNode } from "react";

interface SegmentedControlProps<T extends string> {
  options: readonly T[] | T[];
  value: T;
  onChange: (val: T) => void;
  idPrefix?: string;
  renderLabel?: (val: T) => ReactNode;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  idPrefix = "seg",
  renderLabel,
  className = "",
}: SegmentedControlProps<T>) {
  const getActiveClass = (opt: string) => {
    const lowerOpt = String(opt).toLowerCase();
    if (
      lowerOpt === "expense" ||
      lowerOpt === "spending" ||
      lowerOpt === "debit" ||
      lowerOpt === "savings_to_expenditure"
    ) {
      return "bg-(--accent) text-white shadow-sm shadow-(--accent)/30 dark:shadow-none";
    }
    if (
      lowerOpt === "income" ||
      lowerOpt === "savings" ||
      lowerOpt === "credit" ||
      lowerOpt === "expenditure_to_savings"
    ) {
      return "bg-(--credit) text-white shadow-sm shadow-(--credit)/30 dark:shadow-none";
    }
    return "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)]";
  };

  return (
    <div
      className={`flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-full p-1 gap-1 w-full ${className}`}
    >
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            id={idPrefix ? `${idPrefix}-${option}` : undefined}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 border-none rounded-full py-1.5 text-[0.6875rem] font-bold tracking-wider uppercase cursor-pointer transition-all duration-200 ease-out flex items-center justify-center gap-1 ${
              isActive
                ? getActiveClass(option)
                : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
