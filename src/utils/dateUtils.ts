import { format, getDaysInMonth, getDate } from 'date-fns';

/** Returns the current month-year string e.g. "2026-05" */
export function getCurrentMonthYear(): string {
  return format(new Date(), 'yyyy-MM');
}

/** Returns the number of days remaining in the current month (including today) */
export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const totalDays = getDaysInMonth(now);
  const currentDay = getDate(now);
  return totalDays - currentDay + 1;
}

/** Format a YYYY-MM-DD string to "22 May 2026" */
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return format(new Date(y, m - 1, d), 'd MMM yyyy');
}

/** Format a YYYY-MM string to "May 2026" */
export function formatMonthYear(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  return format(new Date(y, m - 1, 1), 'MMMM yyyy');
}

/** Today as YYYY-MM-DD */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Get previous month string */
export function prevMonthYear(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return format(d, 'yyyy-MM');
}

/** Get next month string */
export function nextMonthYear(monthYear: string): string {
  const [y, m] = monthYear.split('-').map(Number);
  const d = new Date(y, m, 1);
  return format(d, 'yyyy-MM');
}
