import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compare two values for equality (handles null/undefined, empty strings, Files, arrays, objects)
 * Used for form field change detection
 */
export const areValuesEqual = (val1: unknown, val2: unknown): boolean => {
  // Handle null/undefined equality
  if (val1 === val2) return true;
  if (val1 == null && val2 == null) return true;
  if (val1 == null || val2 == null) return false;

  // Handle empty strings vs null/undefined
  if (val1 === "" && val2 == null) return true;
  if (val1 == null && val2 === "") return true;

  // Handle File objects (always consider changed if File is present)
  if (val1 instanceof File || val2 instanceof File) return false;

  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((item, index) => areValuesEqual(item, val2[index]));
  }

  // Handle objects (but not File, which we checked above)
  if (typeof val1 === "object" && typeof val2 === "object") {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      if (
        !areValuesEqual(
          (val1 as Record<string, unknown>)[key],
          (val2 as Record<string, unknown>)[key],
        )
      ) {
        return false;
      }
    }
    return true;
  }

  // Handle primitive values (including number/string comparison)
  return String(val1) === String(val2);
};

/**
 * Extract only the fields that have changed between current and initial values
 * Used to send minimal payloads when updating records
 * @param currentValues - The current form values
 * @param initialValues - The initial form values
 * @param excludeKeys - Keys to exclude from comparison (e.g., 'service_no')
 */
export const getChangedFields = <T extends Record<string, unknown>>(
  currentValues: T,
  initialValues: T,
  excludeKeys: (keyof T)[] = [],
): Partial<T> => {
  const changedFields: Partial<T> = {};

  (Object.keys(currentValues) as Array<keyof T>).forEach((key) => {
    // Skip excluded keys
    if (excludeKeys.includes(key)) return;

    const currentValue = currentValues[key];
    const initialValue = initialValues[key];

    if (!areValuesEqual(currentValue, initialValue)) {
      changedFields[key] = currentValue;
    }
  });

  return changedFields;
};

/**
 * Format a date string to relative time (e.g., "2 days ago", "Just now")
 * @param dateString - ISO date string
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

/**
 * Format a field name to human-readable form (e.g., "first_name" -> "First Name")
 * @param key - Field name in snake_case or camelCase
 * @returns Human-readable field name
 */
export function formatFieldName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function formatNumberWithCommas(
  number: number | string,
  places: number = 0,
): string {
  // Handle string input
  if (typeof number === "string") {
    number = number.trim();
    if (number === "") return "0";
  }

  // Convert to number
  const num = Number(number);

  // Handle invalid numbers
  if (isNaN(num)) return "0";

  // Format with fixed decimal places
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });

  return formatted;
}
