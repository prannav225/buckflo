import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DueDatePickerProps {
  value: number | undefined;
  onChange: (val: number | undefined) => void;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-1.5 bg-(--bg-surface) rounded-(--r-md) pl-2.5 pr-2 border border-black/8 dark:border-white/6 shrink-0 cursor-pointer h-[40px] select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[10px] text-(--text-muted) font-semibold uppercase whitespace-nowrap">Due</span>
        <span className="font-sans text-[13px] font-semibold text-(--text) text-center w-[20px]">
          {value || "—"}
        </span>
        <ChevronDown size={12} className={`text-(--text-muted) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 bottom-[calc(100%+6px)] z-[101] bg-white dark:bg-[#1f1f1e] border border-black/10 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2.5 w-[220px] origin-bottom-right animate-in fade-in zoom-in-95 duration-100">
            <div className="grid grid-cols-7 gap-1">
              <button
                type="button"
                className={`col-span-7 mb-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors ${!value ? "bg-(--accent)/10 text-(--accent)" : "text-(--text-muted) hover:bg-black/5 dark:hover:bg-white/5"}`}
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
              >
                No Due Date
              </button>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                    value === d 
                      ? "bg-(--accent) text-white shadow-md" 
                      : "text-(--text) hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  onClick={() => {
                    onChange(d);
                    setIsOpen(false);
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
