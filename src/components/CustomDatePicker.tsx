import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDate, todayISO } from '../utils/dateUtils';

interface CustomDatePickerProps {
  id?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CustomDatePicker({ id, value, onChange }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const [y, m] = (value || todayISO()).split('-').map(Number);
  const [viewYear, setViewYear] = useState(y);
  const [viewMonth, setViewMonth] = useState(m - 1); // 0-indexed

  // Sync view to selected value when value changes externally
  useEffect(() => {
    if (value) {
      const [ny, nm] = value.split('-').map(Number);
      setViewYear(ny);
      setViewMonth(nm - 1);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setViewYear(v => v - 1);
    } else {
      setViewMonth(v => v - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(v => v + 1);
    } else {
      setViewMonth(v => v + 1);
    }
  };

  const handleDayClick = (e: React.MouseEvent, dayObj: { day: number; month: number; year: number }) => {
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

    const formattedDate = `${clickYear}-${String(clickMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    onChange(formattedDate);
    setOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(formattedDate);
    setOpen(false);
  };

  const calendarDays = getCalendarDays();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Read-only styled trigger element */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          textAlign: 'left',
          width: '100%',
        }}
      >
        <span style={{ color: value ? 'var(--text)' : 'var(--text-muted)' }}>
          {value ? formatDate(value) : 'Select Date'}
        </span>
        <Calendar size={18} style={{ color: 'var(--text-muted)', opacity: 0.8 }} />
      </button>

      {/* Custom dropdown calendar */}
      {open && (
        <div
          className="glass-card-strong pop-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 900,
            padding: 16,
            background: 'var(--bg-surface)',
            boxShadow: 'var(--glass-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            border: 'var(--glass-border)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 'var(--r-sm)', border: 'none',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                className="btn-ghost"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: 'var(--r-sm)', border: 'none',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                className="btn-ghost"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {/* Weekday headers */}
            {WEEKDAYS.map((day, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  opacity: 0.8,
                  padding: '4px 0',
                }}
              >
                {day}
              </span>
            ))}

            {/* Calendar cell items */}
            {calendarDays.map((dayObj, idx) => {
              const cellDateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
              const isSelected = value === cellDateStr;
              const isToday = todayStr === cellDateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDayClick(e, dayObj)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: isToday && !isSelected ? '1.5px solid var(--accent)' : 'none',
                    background: isSelected 
                      ? 'var(--accent)' 
                      : 'transparent',
                    color: isSelected 
                      ? '#fff' 
                      : !dayObj.isCurrentMonth
                        ? 'var(--text-muted)'
                        : 'var(--text)',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected || isToday ? '600' : '400',
                    cursor: 'pointer',
                    opacity: !dayObj.isCurrentMonth ? 0.4 : 1,
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                  className={isSelected ? 'chip-active' : 'btn-ghost-cell'}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--border)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setOpen(false); }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', padding: '4px 8px'
              }}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={{
                background: 'transparent', border: 'none', color: 'var(--accent)',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: '4px 8px'
              }}
              className="btn-ghost"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
