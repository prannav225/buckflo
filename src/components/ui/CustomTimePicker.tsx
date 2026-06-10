/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";

interface CustomTimePickerProps {
  value: string; // "HH:mm" 24h format
  onChange: (value: string) => void;
  id?: string;
}

export function CustomTimePicker({
  value,
  onChange,
  id,
}: CustomTimePickerProps) {
  const [localValue, setLocalValue] = useState(value || "20:00");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync with external value if it changes
  useEffect(() => {
    setLocalValue(value || "20:00");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (val && val !== value) {
        onChange(val);
      }
    }, 500); // Debounce to avoid spamming saves while typing
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localValue && localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="relative font-sans text-left inline-block" id={id}>
      <div className="relative flex items-center bg-[rgba(217,119,87,0.08)] dark:bg-[rgba(217,119,87,0.12)] border border-(--accent)/20 hover:bg-[rgba(217,119,87,0.15)] dark:hover:bg-[rgba(217,119,87,0.2)] rounded-xl px-4 py-1.5 transition-all shadow-sm focus-within:ring-2 focus-within:ring-(--accent)/50">
        <input
          type="time"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="bg-transparent border-none text-sm font-semibold text-(--accent) cursor-pointer outline-none w-full"
          style={{
            colorScheme: "dark light",
          }}
          aria-label="Select time"
        />
      </div>
    </div>
  );
}
