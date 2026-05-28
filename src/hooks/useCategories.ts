import { useLiveQuery } from "dexie-react-hooks";
import { db, type Category } from "../db/database";

/**
 * Live-reactive hook returning all categories from the DB.
 * Falls back to an empty array while loading.
 */
export function useCategories(): Category[] {
  return useLiveQuery(() => db.categories.toArray(), [], []);
}

/**
 * Lookup helper: returns the colour for a given category name.
 * Returns a neutral grey if the category isn't found in the DB.
 */
export function getCategoryColor(
  categories: Category[],
  categoryName: string | undefined,
): string {
  if (!categoryName) return "#9d9d99";
  const cat = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
  );
  return cat?.color || "#9d9d99";
}

/**
 * Returns a hex colour at a given opacity as an rgba string.
 * Useful for category badge backgrounds (15% opacity) etc.
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Handle CSS variables or non-hex values — return as-is with opacity
  if (!hex.startsWith("#")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
