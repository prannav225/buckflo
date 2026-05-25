import { useState, useEffect, useRef } from "react";
import { todayISO } from "../utils/dateUtils";

export function useDatePicker(value: string, onChange: (val: string) => void) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value and manage render-time prop synchronization
  const [prevValue, setPrevValue] = useState(value);
  const [viewYear, setViewYear] = useState(() => {
    const parts = (value || todayISO()).split("-").map(Number);
    return parts[0];
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const parts = (value || todayISO()).split("-").map(Number);
    return parts[1] - 1;
  });

  if (value !== prevValue) {
    setPrevValue(value);
    const parts = (value || todayISO()).split("-").map(Number);
    setViewYear(parts[0]);
    setViewMonth(parts[1] - 1);
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Get calendar days grid
  const getCalendarDays = () => {
    const days = [];
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    // Muted days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: viewMonth - 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }

    // Days of current month
    const currentMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let i = 1; i <= currentMonthDays; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Muted days from next month
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewYear,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((v) => v - 1);
    } else {
      setViewMonth((v) => v - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((v) => v + 1);
    } else {
      setViewMonth((v) => v + 1);
    }
  };

  const handleDayClick = (
    e: React.MouseEvent,
    dayObj: { day: number; month: number; year: number },
  ) => {
    e.preventDefault();
    let clickYear = dayObj.year;
    let clickMonth = dayObj.month;

    if (clickMonth < 0) {
      clickMonth = 11;
      clickYear -= 1;
    } else if (clickMonth > 11) {
      clickMonth = 0;
      clickYear += 1;
    }

    const formattedDate = `${clickYear}-${String(clickMonth + 1).padStart(
      2,
      "0",
    )}-${String(dayObj.day).padStart(2, "0")}`;
    onChange(formattedDate);
    setOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    onChange(formattedDate);
    setOpen(false);
  };

  return {
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
  };
}
