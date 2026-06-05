/**
 * Format a number based on the user's preferred currency in localStorage.
 * Defaults to INR.
 */
export function formatCurrency(amount: number, decimals = 2, compactThreshold: number = 100000): string {
  let currencyCode = 'INR';
  if (typeof window !== 'undefined') {
    currencyCode = localStorage.getItem('buckflo_currency') || 'INR';
  }

  let locale = 'en-US';
  if (currencyCode === 'INR') locale = 'en-IN';
  else if (currencyCode === 'EUR') locale = 'de-DE';
  else if (currencyCode === 'GBP') locale = 'en-GB';

  const isCompact = Math.abs(amount) >= compactThreshold;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isCompact ? 0 : decimals,
    maximumFractionDigits: isCompact ? 1 : decimals,
    notation: isCompact ? "compact" : "standard",
  });
  return formatter.format(amount);
}

/**
 * Backward compatibility alias for any lingering references
 */
export const formatINR = formatCurrency;

/**
 * Format a plain number with Indian comma grouping (no ₹ symbol).
 */
export function formatNumber(amount: number, decimals = 2, minDecimals = decimals): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

