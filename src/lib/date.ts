// Shared local-day-key helpers. Builds a `YYYY-MM-DD` string from a Date's
// local (not UTC) components, so day boundaries match the user's timezone.

/** `YYYY-MM-DD` for the given Date, using local (not UTC) components. */
export function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
