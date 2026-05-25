/**
 * Format a number as Indian Rupees (₹) with Indian numbering system.
 * e.g. 123456.78 → "₹1,23,456.78"
 */
export function formatINR(amount: number, decimals = 2): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return formatter.format(amount);
}

/**
 * Format a plain number with Indian comma grouping (no ₹ symbol).
 */
export function formatNumber(amount: number, decimals = 2, minDecimals = decimals): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

