export const CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping',
  'Healthcare', 'Entertainment', 'Rent', 'Transfer', 'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
