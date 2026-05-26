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
  return (
    <div
      className={`flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-full p-1 gap-1 w-full ${className}`}
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
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-black/5 dark:border-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
                : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
