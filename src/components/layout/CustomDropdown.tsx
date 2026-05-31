import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption<T> {
  value: T;
  label: string;
}

interface CustomDropdownProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  id?: string;
}

export function CustomDropdown<T extends string>({
  options,
  value,
  onChange,
  id,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block w-full text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-(--text) outline-none cursor-pointer flex items-center gap-1.5 hover:bg-black/8 dark:hover:bg-white/8 transition-colors select-none"
        id={id}
      >
        <span>{activeOption?.label || value}</span>
        <ChevronDown
          size={14}
          className={`text-(--text-muted) transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile backdrop utility to close menu on tap outside */}
          <div
            className="fixed inset-0 z-190 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute top-[calc(100%+8px)] left-0 w-full min-w-max bg-[#e2e2df] dark:bg-[#2d2d2c] text-(--text) rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-200 border border-black/8 dark:border-white/8 pop-in"
            role="menu"
            aria-orientation="vertical"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-center py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-(--accent) text-white shadow-sm"
                      : "text-(--text) hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  role="menuitem"
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
