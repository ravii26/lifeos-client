/**
 * Pragmatic iCal RRULE helpers for the calendar.
 *
 * We only support the recurrence shapes the UI can express — daily, weekly
 * (optionally on specific weekdays), and monthly. This is intentionally not a
 * full RFC 5545 parser; it round-trips the rules this app produces and
 * gracefully describes anything else.
 */

export type Freq = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "UNSUPPORTED";

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
  /** Original RRULE string, kept only when `freq === "UNSUPPORTED"` so an
   * untouched custom rule (e.g. set from mobile) round-trips instead of
   * being silently replaced with `NONE` by this UI's limited vocabulary. */
  raw?: string;
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
    case "UNSUPPORTED":
      return state.raw;
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

  // Keys this UI's vocabulary actually accounts for, per FREQ. Anything else
  // present in the rule (INTERVAL, COUNT, UNTIL, BYMONTHDAY, WKST, an
  // unrecognized BYDAY token, ...) means this UI would silently drop
  // information it can't represent, so treat the whole rule as unsupported.
  const recognizedKeys: Record<string, Set<string>> = {
    DAILY: new Set(["FREQ"]),
    WEEKLY: new Set(["FREQ", "BYDAY"]),
    MONTHLY: new Set(["FREQ"]),
  };
  const keys = Object.keys(parts);
  const allKeysRecognized =
    !!freq && !!recognizedKeys[freq] && keys.every((k) => recognizedKeys[freq]!.has(k));
  const byDayFullyRecognized =
    !parts.BYDAY || byDay.length === parts.BYDAY.split(",").length;

  switch (freq) {
    case "DAILY":
      if (allKeysRecognized) return { freq: "DAILY", byDay: [] };
      break;
    case "WEEKLY":
      if (allKeysRecognized && byDayFullyRecognized) {
        return { freq: "WEEKLY", byDay: orderDays(byDay) };
      }
      break;
    case "MONTHLY":
      if (allKeysRecognized) return { freq: "MONTHLY", byDay: [] };
      break;
  }
  // A recurrence this UI can't fully express (e.g. a custom rule set from
  // mobile with INTERVAL/COUNT/UNTIL/BYMONTHDAY, or an unrecognized FREQ) —
  // keep the raw string so an untouched save round-trips it instead of
  // silently overwriting or truncating it.
  return { freq: "UNSUPPORTED", byDay: [], raw: rule };
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
    case "UNSUPPORTED":
      return "Custom recurrence";
    default:
      return "Does not repeat";
  }
}

function orderDays(days: IcalDay[]): IcalDay[] {
  return WEEKDAY_ORDER.filter((d) => days.includes(d));
}
