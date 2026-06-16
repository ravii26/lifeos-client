import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely.
 * - clsx: lets us pass conditional/array/object class inputs.
 * - twMerge: resolves conflicting Tailwind utilities so the last one wins
 *   (e.g. cn("p-2", "p-4") -> "p-4" instead of both).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
