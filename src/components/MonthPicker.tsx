import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear, prevMonthYear, nextMonthYear, getCurrentMonthYear } from '../utils/dateUtils';

interface MonthPickerProps {
  monthYear: string;
  onChange: (nextMonthYear: string) => void;
  isSavings?: boolean;
  compact?: boolean;
}

export function MonthPicker({ monthYear, onChange, isSavings = false, compact = false }: MonthPickerProps) {
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

  if (compact) {
    return (
      <div className="month-picker-compact" style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-glass)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--r-pill)',
        padding: '2px 4px',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
      }}>
        <button 
          onClick={goToPrev} 
          id={prevId}
          type="button"
          style={{
            width: 24, height: 24, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ 
          fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', 
          padding: '0 6px', display: 'flex', alignItems: 'center', gap: 4,
          whiteSpace: 'nowrap'
        }}>
          {formatMonthYear(monthYear)}
          {isCurrentMonth && (
            <span style={{
              background: pillBackground,
              color: pillColor,
              borderRadius: 999,
              padding: '1px 5px',
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Now
            </span>
          )}
        </span>
        <button 
          onClick={goToNext} 
          disabled={isCurrentMonth} 
          id={nextId}
          type="button"
          style={{
            width: 24, height: 24, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0, opacity: isCurrentMonth ? 0.25 : 1
          }}
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

