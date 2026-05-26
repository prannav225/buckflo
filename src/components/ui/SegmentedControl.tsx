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
      className={`flex bg-gray-600/10 dark:bg-gray-400 border border-black/6 dark:border-white/6 rounded-full p-1 gap-1 w-full ${className}`}
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
                ? "bg-white dark:bg-[#2d2d2c] text-black dark:text-white border border-black/5 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {renderLabel ? renderLabel(option) : option}
          </button>
        );
      })}
    </div>
  );
}
