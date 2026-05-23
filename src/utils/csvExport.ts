import type { Transaction } from '../db/database';
import { formatDate } from './dateUtils';

/**
 * Export a list of transactions as a CSV file.
 * Columns: Date, Description, Amount (matching Google Sheets format)
 */
export function exportTransactionsCSV(
  transactions: Transaction[],
  filename = 'flo-export.csv',
): void {
  const header = ['Date', 'Description', 'Category', 'Amount', 'Type'];
  const rows = transactions.map((tx) => [
    formatDate(tx.date),
    `"${tx.description.replace(/"/g, '""')}"`, // escape double quotes
    `"${(tx.category || '').replace(/"/g, '""')}"`, // escape double quotes in category
    tx.type === 'debit' ? `-${tx.amount.toFixed(2)}` : tx.amount.toFixed(2),
    tx.type,
  ]);

  const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
