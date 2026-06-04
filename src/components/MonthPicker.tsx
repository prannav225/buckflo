import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthYear,
  prevMonthYear,
  nextMonthYear,
  getCurrentMonthYear,
} from "../utils/dateUtils";
import { hapticFeedback } from "../utils/haptics";

interface MonthPickerProps {
  monthYear: string;
  onChange: (nextMonthYear: string) => void;
  isSavings?: boolean;
  compact?: boolean;
}

export function MonthPicker({
  monthYear,
  onChange,
  isSavings = false,
  compact = false,
}: MonthPickerProps) {
  const currentMonthYear = getCurrentMonthYear();
  const isCurrentMonth = monthYear === currentMonthYear;

  const goToPrev = () => {
    hapticFeedback.light();
    onChange(prevMonthYear(monthYear));
  };
  const goToNext = () => {
    const next = nextMonthYear(monthYear);
    if (next <= currentMonthYear) {
      hapticFeedback.light();
      onChange(next);
    }
  };

  const prevId = isSavings ? "savings-btn-prev-month" : "btn-prev-month";
  const nextId = isSavings ? "savings-btn-next-month" : "btn-next-month";

  if (compact) {
    return (
      <div className="month-picker-compact inline-flex items-center bg-(--bg-glass) border border-black/8 dark:border-white/6 rounded-(--r-pill) p-0.5 shadow-(--glass-shadow) [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)]">
        <button
          onClick={goToPrev}
          id={prevId}
          type="button"
          className="w-6 h-6 border-none bg-transparent text-(--text-muted) flex items-center justify-center cursor-pointer p-0 active:bg-black/5 dark:active:bg-white/5 rounded-full"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[0.8125rem] font-semibold text-(--text) px-1.5 flex items-center gap-1 whitespace-nowrap">
          {formatMonthYear(monthYear)}
          {isCurrentMonth && (
            <span
              className={`rounded-full px-1.25 py-0.25 text-[0.5625rem] font-bold uppercase tracking-wider ${
                isSavings
                  ? "bg-[rgba(90,158,111,0.14)] text-(--credit)"
                  : "bg-[rgba(217,119,87,0.12)] text-(--accent)"
              }`}
            >
              Now
            </span>
          )}
        </span>
        <button
          onClick={goToNext}
          disabled={isCurrentMonth}
          id={nextId}
          type="button"
          className={`w-6 h-6 border-none bg-transparent text-(--text-muted) flex items-center justify-center cursor-pointer p-0 active:bg-black/5 dark:active:bg-white/5 rounded-full ${
            isCurrentMonth ? "opacity-25" : "opacity-100"
          }`}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="month-picker">
      <button onClick={goToPrev} aria-label="Previous month" id={prevId}>
        <ChevronLeft size={18} />
      </button>
      <span className="flex-1 text-center text-base">
        {formatMonthYear(monthYear)}
        {isCurrentMonth && (
          <span
            className={`pill ml-2 text-[0.625rem] ${
              isSavings
                ? "bg-[rgba(90,158,111,0.14)] text-(--credit)"
                : "bg-[rgba(217,119,87,0.12)] text-(--accent)"
            }`}
          >
            Current
          </span>
        )}
      </span>
      <button
        onClick={goToNext}
        disabled={isCurrentMonth}
        aria-label="Next month"
        id={nextId}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
