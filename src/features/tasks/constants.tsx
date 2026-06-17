import type { Priority, Recurrence, TaskType } from "./types";

/**
 * Priority metadata. `dot` is a token-based color class so the palette stays
 * themeable; `tone` is the text class used on the row badge.
 */
export const PRIORITIES: {
  value: Priority;
  label: string;
  dot: string;
  tone: string;
  /** Short pill code + hex for the design's `.pri` pill. */
  code: string;
  hex: string;
}[] = [
  { value: "LOW", label: "Low", dot: "bg-tx-4", tone: "text-tx-3", code: "P3", hex: "#6b717a" },
  { value: "MEDIUM", label: "Medium", dot: "bg-ok", tone: "text-ok", code: "P2", hex: "#ffb547" },
  { value: "HIGH", label: "High", dot: "bg-warn", tone: "text-warn", code: "P1", hex: "#ff8a8a" },
  { value: "CRITICAL", label: "Critical", dot: "bg-danger", tone: "text-danger", code: "P0", hex: "#ff5d62" },
];

/** Renders the `.pri` pill for a priority value (design-faithful). */
export function priStyle(hex: string) {
  return { color: hex, background: `${hex}24` };
}

export const PRIORITY_BY_VALUE = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p]),
) as Record<Priority, (typeof PRIORITIES)[number]>;

export const TASK_TYPES: { value: TaskType; label: string; hint: string }[] = [
  { value: "BOOLEAN", label: "Simple", hint: "Done or not done" },
  { value: "COUNT", label: "Count", hint: "Track a target number" },
  { value: "TIMER", label: "Timer", hint: "Track target minutes" },
];

export const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];
