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

/** Get total days in the current month */
export function getDaysInCurrentMonth(): number {
  return getDaysInMonth(new Date());
}

/** Get elapsed days in the current month (at least 1) */
export function getDaysElapsedInMonth(): number {
  return Math.max(1, getDate(new Date()));
}

/** Get startDate and endDate for a given YYYY-MM monthYear string */
export function getMonthDateRange(monthYear: string): { startDate: string; endDate: string } {
  const [year, month] = monthYear.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

/** Check if a given timestamp string is within 24 hours of the current time */
export function isDismissedWithin24Hours(dismissedTimeStr: string | null): boolean {
  if (!dismissedTimeStr) return false;
  const lastDismissed = new Date(parseInt(dismissedTimeStr, 10));
  const diffHours = (Date.now() - lastDismissed.getTime()) / (1000 * 60 * 60);
  return diffHours < 24;
}

