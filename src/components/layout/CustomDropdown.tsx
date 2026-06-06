import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  id?: string;
  variant?: "default" | "form" | "chip";
  iconOnly?: boolean;
  isActive?: boolean;
  align?: "left" | "right";
  containerClassName?: string;
}

export function CustomDropdown<T extends string>({
  options,
  value,
  onChange,
  id,
  variant = "default",
  iconOnly = false,
  isActive = false,
  align = "left",
  containerClassName,
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
  const isForm = variant === "form";

  return (
    <div className={`relative text-left ${variant !== "chip" ? "w-full" : "w-auto"} ${containerClassName || "inline-block"}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          isForm
            ? "input-field flex items-center justify-between cursor-pointer select-none text-left w-full"
            : variant === "chip"
              ? `${isActive ? "bg-(--accent) text-white border-transparent" : "bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 text-(--text) hover:bg-black/10 dark:hover:bg-white/10"} rounded-full ${
                  iconOnly ? "p-1.5 aspect-square flex items-center justify-center" : "px-2.5 py-1 w-full justify-between"
                } text-[11px] font-semibold outline-none cursor-pointer flex items-center gap-1 transition-colors select-none whitespace-nowrap shrink-0`
              : `justify-between bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-lg ${
                  iconOnly ? "p-2 aspect-square flex items-center justify-center" : "px-2.5 py-1.5 w-full"
                } text-[0.8125rem] font-semibold text-(--text) outline-none cursor-pointer flex items-center gap-1.5 hover:bg-black/8 dark:hover:bg-white/8 transition-colors select-none`
        }
        id={id}
      >
        {iconOnly ? (
          activeOption?.icon
        ) : (
          <>
            <span className="flex items-center gap-1">
              {activeOption?.icon}
              <span className="truncate max-w-[120px]">{activeOption?.label || value}</span>
            </span>
            <ChevronDown
              size={isForm ? 18 : variant === "chip" ? 12 : 14}
              className={`${isActive ? "text-white/80" : "text-(--text-muted)"} transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[190] md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={`absolute top-[calc(100%+8px)] ${align === "right" ? "right-0" : "left-0"} min-w-max bg-[#e2e2df] dark:bg-[#2d2d2c] text-(--text) rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-[200] pop-in max-h-64 overflow-y-auto no-scrollbar`}
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
                  className={`w-full text-left py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none flex items-center justify-start gap-2 ${
                    isSelected
                      ? "bg-(--accent) text-white shadow-sm"
                      : "text-(--text) hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
