// Shared date/time helpers for calendar block forms.

/** Split an ISO timestamp into local `YYYY-MM-DD` and `HH:MM` fields. */
export function splitIso(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Join a local `YYYY-MM-DD` date and `HH:MM` time into an ISO timestamp. */
export function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}
