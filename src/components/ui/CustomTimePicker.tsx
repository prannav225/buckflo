import { useState, useRef, useEffect } from "react";
import { Clock, Plus, Minus } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // "HH:mm" 24h format
  onChange: (value: string) => void;
  id?: string;
}

export function CustomTimePicker({ value, onChange, id }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current 24h value
  const [h24, m24] = (value || "20:00").split(":").map(Number);
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  // Selected states (internal local buffer)
  const [selectedHour, setSelectedHour] = useState(h12);
  const [selectedMinute, setSelectedMinute] = useState(m24);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(period);

  // Sync state with incoming value prop (only when popover is closed)
  useEffect(() => {
    if (!isOpen) {
      const [h, m] = (value || "20:00").split(":").map(Number);
      const p = h >= 12 ? "PM" : "AM";
      const h12Val = h % 12 === 0 ? 12 : h % 12;
      setSelectedHour(h12Val);
      setSelectedMinute(m);
      setSelectedPeriod(p);
    }
  }, [value, isOpen]);

  // Formats current state and triggers onChange if it differs from current value
  const saveTimeChange = () => {
    let h24Val = selectedHour;
    if (selectedPeriod === "PM" && selectedHour !== 12) h24Val += 12;
    if (selectedPeriod === "AM" && selectedHour === 12) h24Val = 0;
    const formatted = `${String(h24Val).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
    if (formatted !== value) {
      onChange(formatted);
    }
  };

  // Close when clicking outside, and save final value
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        saveTimeChange();
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, selectedHour, selectedMinute, selectedPeriod, value, onChange]);

  const handleHourIncrement = () => {
    setSelectedHour((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const handleHourDecrement = () => {
    setSelectedHour((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleMinuteIncrement = () => {
    setSelectedMinute((prev) => (Math.floor(prev / 5) * 5 + 5) % 60);
  };

  const handleMinuteDecrement = () => {
    setSelectedMinute((prev) => (Math.ceil(prev / 5) * 5 - 5 + 60) % 60);
  };

  const handlePeriodToggle = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
  };

  const toggleOpen = () => {
    if (isOpen) {
      saveTimeChange();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleDone = () => {
    saveTimeChange();
    setIsOpen(false);
  };

  const displayTime = `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")} ${selectedPeriod}`;

  return (
    <div className="relative font-sans text-left" ref={containerRef} id={id}>
      {/* Time display button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2.5 bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/6 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-(--text) cursor-pointer select-none outline-none transition-all shadow-sm"
      >
        <span>{displayTime}</span>
        <Clock size={15} className="text-(--text-muted) shrink-0" />
      </button>

      {/* Clean Glassmorphic Digital Stepper Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-9999 w-[190px] glass-card p-4 shadow-xl flex flex-col gap-4 animate-fade-in">
          {/* Header */}
          <div className="text-[10px] font-bold tracking-wider uppercase text-(--text-muted) text-center border-b border-black/5 dark:border-white/5 pb-2">
            Set Reminder Time
          </div>

          {/* Stepper Grid */}
          <div className="flex items-center justify-center gap-3 px-1">
            {/* Hours Stepper */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleHourIncrement}
                className="w-10 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--text) hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Increment Hour"
              >
                <Plus size={15} />
              </button>
              <span className="font-display text-3xl font-bold text-(--text) select-none w-10 text-center py-1">
                {String(selectedHour).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleHourDecrement}
                className="w-10 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--text) hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Decrement Hour"
              >
                <Minus size={15} />
              </button>
            </div>

            {/* Separator */}
            <span className="font-display text-3xl font-bold text-(--text-muted) select-none pb-2">:</span>

            {/* Minutes Stepper */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleMinuteIncrement}
                className="w-10 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--text) hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Increment Minutes"
              >
                <Plus size={15} />
              </button>
              <span className="font-display text-3xl font-bold text-(--text) select-none w-10 text-center py-1">
                {String(selectedMinute).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={handleMinuteDecrement}
                className="w-10 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--text) hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Decrement Minutes"
              >
                <Minus size={15} />
              </button>
            </div>
          </div>

          {/* Period Selector (AM/PM) */}
          <div className="grid grid-cols-2 gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodToggle(p)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedPeriod === p
                    ? "bg-(--accent) text-white shadow-md"
                    : "text-(--text-muted) hover:text-(--text-secondary)"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleDone}
            className="btn-primary text-xs py-2.5 w-full shadow-sm font-semibold cursor-pointer rounded-xl"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
