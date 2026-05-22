import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear, prevMonthYear, nextMonthYear, getCurrentMonthYear } from '../utils/dateUtils';

interface MonthPickerProps {
  monthYear: string;
  onChange: (nextMonthYear: string) => void;
  isSavings?: boolean;
}

export function MonthPicker({ monthYear, onChange, isSavings = false }: MonthPickerProps) {
  const currentMonthYear = getCurrentMonthYear();
  const isCurrentMonth = monthYear === currentMonthYear;

  const goToPrev = () => onChange(prevMonthYear(monthYear));
  const goToNext = () => {
    const next = nextMonthYear(monthYear);
    if (next <= currentMonthYear) {
      onChange(next);
    }
  };

  const pillBackground = isSavings ? 'rgba(90,158,111,0.14)' : 'rgba(217,119,87,0.12)';
  const pillColor = isSavings ? 'var(--credit)' : 'var(--accent)';
  const prevId = isSavings ? 'savings-btn-prev-month' : 'btn-prev-month';
  const nextId = isSavings ? 'savings-btn-next-month' : 'btn-next-month';

  return (
    <div className="month-picker">
      <button onClick={goToPrev} aria-label="Previous month" id={prevId}>
        <ChevronLeft size={18} />
      </button>
      <span style={{ flex: 1, textAlign: 'center', fontSize: '1rem' }}>
        {formatMonthYear(monthYear)}
        {isCurrentMonth && (
          <span className="pill" style={{
            background: pillBackground,
            color: pillColor,
            marginLeft: 8,
            fontSize: '0.625rem',
          }}>
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
