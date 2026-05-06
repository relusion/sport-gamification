import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Single composition point for Tailwind class names. Combines clsx (for
 * conditional class objects/arrays) and tailwind-merge (for conflict
 * resolution: e.g. `p-2 p-4` collapses to `p-4`).
 *
 * Constraint #20: every primitive composes classes through this helper. No
 * hand-written class concatenation in components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
