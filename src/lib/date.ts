// Shared local-day-key helpers. Builds a `YYYY-MM-DD` string from a Date's
// local (not UTC) components, so day boundaries match the user's timezone.

/** `YYYY-MM-DD` for the given Date, using local (not UTC) components. */
export function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Parses an ISO string, returning null if missing or invalid. */
export function safeDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Jul 12" */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** "Jul 12, 2026" */
export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Sunday, Jul 12" */
export function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** "Sun" */
export function formatWeekdayShort(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

/** Relative time like "5m ago", "2d ago", or "now". Null for missing/invalid input. */
export function timeAgo(iso?: string): string | null {
  const then = safeDate(iso)?.getTime();
  if (then == null) return null;
  const secs = Math.round((Date.now() - then) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let val = secs;
  let unit = "s";
  for (const [step, label] of units) {
    if (Math.abs(val) < step) {
      unit = label;
      break;
    }
    val = Math.round(val / step);
    unit = label;
  }
  return val <= 0 ? "now" : `${val}${unit} ago`;
}
