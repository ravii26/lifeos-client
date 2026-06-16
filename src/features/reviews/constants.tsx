import type { InsightStatus, ReviewType } from "./types";

export const REVIEW_TYPES: { value: ReviewType; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export const INSIGHT_STATUSES: {
  value: InsightStatus;
  label: string;
  dot: string;
  tone: string;
}[] = [
  { value: "PENDING", label: "Pending", dot: "bg-tx-4", tone: "text-tx-3" },
  {
    value: "IMPLEMENTED",
    label: "Implemented",
    dot: "bg-ok",
    tone: "text-ok",
  },
  {
    value: "STILL_WORKING",
    label: "Still working",
    dot: "bg-warn",
    tone: "text-warn",
  },
  {
    value: "NOT_APPLICABLE",
    label: "Not applicable",
    dot: "bg-tx-4",
    tone: "text-tx-4",
  },
];

export const INSIGHT_STATUS_BY_VALUE = Object.fromEntries(
  INSIGHT_STATUSES.map((s) => [s.value, s]),
) as Record<InsightStatus, (typeof INSIGHT_STATUSES)[number]>;

/**
 * Given a review type, return the [start, end] ISO datetimes for the period
 * that contains `ref` (default now). Lets the form pre-fill sensible dates.
 */
export function periodFor(
  type: ReviewType,
  ref = new Date(),
): { start: string; end: string } {
  const d = new Date(ref);
  let start: Date;
  let end: Date;
  switch (type) {
    case "DAILY":
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      break;
    case "WEEKLY": {
      // Week starts Monday.
      const day = (d.getDay() + 6) % 7;
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59);
      break;
    }
    case "MONTHLY":
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "YEARLY":
      start = new Date(d.getFullYear(), 0, 1);
      end = new Date(d.getFullYear(), 11, 31, 23, 59, 59);
      break;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

/** YYYY-MM-DD for a date input value. */
export function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
