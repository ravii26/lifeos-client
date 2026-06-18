/**
 * Pragmatic iCal RRULE helpers for the calendar.
 *
 * We only support the recurrence shapes the UI can express — daily, weekly
 * (optionally on specific weekdays), and monthly. This is intentionally not a
 * full RFC 5545 parser; it round-trips the rules this app produces and
 * gracefully describes anything else.
 */

export type Freq = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

// iCal weekday codes, indexed to match JS Date.getDay() (0 = Sunday).
const ICAL_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
export type IcalDay = (typeof ICAL_DAYS)[number];

const DAY_LABEL: Record<IcalDay, string> = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun",
};

// Display + selection order (week starts Monday).
export const WEEKDAY_ORDER: IcalDay[] = [
  "MO",
  "TU",
  "WE",
  "TH",
  "FR",
  "SA",
  "SU",
];

export interface RecurrenceState {
  freq: Freq;
  byDay: IcalDay[];
}

export const NO_RECURRENCE: RecurrenceState = { freq: "NONE", byDay: [] };

export function icalDayLabel(d: IcalDay): string {
  return DAY_LABEL[d];
}

export function dayFromDate(iso: string): IcalDay {
  return ICAL_DAYS[new Date(iso).getDay()];
}

/** Build an RRULE string, or `undefined` for a one-off block. */
export function buildRule(state: RecurrenceState): string | undefined {
  switch (state.freq) {
    case "DAILY":
      return "FREQ=DAILY";
    case "WEEKLY": {
      const days = state.byDay.length
        ? `;BYDAY=${orderDays(state.byDay).join(",")}`
        : "";
      return `FREQ=WEEKLY${days}`;
    }
    case "MONTHLY":
      return "FREQ=MONTHLY";
    case "NONE":
    default:
      return undefined;
  }
}

/** Parse an RRULE string back into editable UI state. */
export function parseRule(rule: string | null | undefined): RecurrenceState {
  if (!rule) return { ...NO_RECURRENCE };
  const parts = Object.fromEntries(
    rule
      .split(";")
      .map((p) => p.split("="))
      .filter((kv) => kv.length === 2)
      .map(([k, v]) => [k.toUpperCase(), v.toUpperCase()]),
  );
  const freq = parts.FREQ as string | undefined;
  const byDay = parts.BYDAY
    ? (parts.BYDAY.split(",").filter((d) =>
        (ICAL_DAYS as readonly string[]).includes(d),
      ) as IcalDay[])
    : [];

  switch (freq) {
    case "DAILY":
      return { freq: "DAILY", byDay: [] };
    case "WEEKLY":
      return { freq: "WEEKLY", byDay: orderDays(byDay) };
    case "MONTHLY":
      return { freq: "MONTHLY", byDay: [] };
    default:
      return { ...NO_RECURRENCE };
  }
}

/** Human-readable summary, e.g. "Weekly on Mon, Wed, Fri". */
export function describeRule(rule: string | null | undefined): string {
  const { freq, byDay } = parseRule(rule);
  switch (freq) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return byDay.length
        ? `Weekly on ${byDay.map(icalDayLabel).join(", ")}`
        : "Weekly";
    case "MONTHLY":
      return "Monthly";
    default:
      return "Does not repeat";
  }
}

function orderDays(days: IcalDay[]): IcalDay[] {
  return WEEKDAY_ORDER.filter((d) => days.includes(d));
}
