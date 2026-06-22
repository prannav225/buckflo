import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { useDatePicker } from "../hooks/useDatePicker";

interface CustomDatePickerProps {
  id?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  align?: "left" | "right" | "center";
  direction?: "up" | "down";
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CustomDatePicker({
  id,
  value,
  onChange,
  align = "left",
  direction = "up",
}: CustomDatePickerProps) {
  const {
    open,
    setOpen,
    containerRef,
    viewYear,
    viewMonth,
    getCalendarDays,
    handlePrevMonth,
    handleNextMonth,
    handleDayClick,
    handleToday,
  } = useDatePicker(value, onChange);

  const calendarDays = getCalendarDays();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Read-only styled trigger element */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex items-center justify-between cursor-pointer select-none text-left w-full"
      >
        <span className={value ? "text-(--text)" : "text-(--text-muted)"}>
          {value ? formatDate(value) : "Select Date"}
        </span>
        <Calendar size={18} className="text-(--text-muted) opacity-80" />
      </button>

      {/* Custom dropdown calendar */}
      {open && (
        <div
          className={`glass-card-strong pop-in absolute z-900 p-4 bg-(--bg-surface) shadow-(--glass-shadow-lg) flex flex-col gap-3 border border-black/8 dark:border-white/6 [backdrop-filter:var(--glass-blur)] [-webkit-backdrop-filter:var(--glass-blur)] w-[260px] ${direction === "up" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"} ${align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"}`}
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[0.9375rem] text-(--text)">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="btn-ghost flex items-center justify-center w-9 h-9 rounded-(--r-sm) border-none bg-transparent text-(--text-secondary) cursor-pointer transition-colors p-0"
                aria-label="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="btn-ghost flex items-center justify-center w-9 h-9 rounded-(--r-sm) border-none bg-transparent text-(--text-secondary) cursor-pointer transition-colors p-0"
                aria-label="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Weekday headers */}
            {WEEKDAYS.map((day, idx) => (
              <span
                key={idx}
                className="text-[0.6875rem] font-semibold text-(--text-muted) opacity-80 py-1"
              >
                {day}
              </span>
            ))}

            {/* Calendar cell items */}
            {calendarDays.map((dayObj, idx) => {
              const cellDateStr = `${dayObj.year}-${String(
                dayObj.month + 1,
              ).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;
              const isSelected = value === cellDateStr;
              const isToday = todayStr === cellDateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDayClick(e, dayObj)}
                  className={`flex items-center justify-center aspect-square rounded-full border-none transition-all duration-150 outline-none cursor-pointer text-[0.8125rem] ${
                    isSelected
                      ? "bg-(--accent) text-white font-semibold"
                      : "bg-transparent hover:bg-(--border) text-(--text)"
                  } ${
                    isToday && !isSelected
                      ? "border-[1.5px] border-(--accent)! font-semibold"
                      : ""
                  } ${!dayObj.isCurrentMonth ? "text-(--text-muted)! opacity-40" : ""}`}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex justify-between border-t border-(--border) pt-2.5 mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="btn-ghost bg-transparent border-none text-(--text-secondary) text-[0.8125rem] font-medium cursor-pointer py-1 px-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="btn-ghost bg-transparent border-none text-(--accent) text-[0.8125rem] font-semibold cursor-pointer py-1 px-2"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
