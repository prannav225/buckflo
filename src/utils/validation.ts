/**
 * Cleans a display name by removing non-alphabetic characters and limiting to 20 characters.
 */
export function cleanDisplayName(name: string): string {
  return name.replace(/[^A-Za-z]/g, "").slice(0, 20);
}
