import type { Day, HabitFrequency, HabitType } from "./types";

export const HABIT_TYPES: { value: HabitType; label: string; hint: string }[] = [
  { value: "BOOLEAN", label: "Simple", hint: "Did it or didn't" },
  { value: "COUNT", label: "Count", hint: "Hit a target number" },
  { value: "TIMER", label: "Timer", hint: "Spend target minutes" },
];

export const FREQUENCIES: {
  value: HabitFrequency;
  label: string;
  hint: string;
}[] = [
  { value: "DAILY", label: "Daily", hint: "Every day" },
  { value: "WEEKLY", label: "Weekly", hint: "N times a week" },
  { value: "CUSTOM", label: "Custom", hint: "Specific weekdays" },
];

/** Ordered Mon→Sun; `value` is the exact enum string the backend expects. */
export const DAYS: { value: Day; label: string }[] = [
  { value: "MON", label: "M" },
  { value: "TUE", label: "T" },
  { value: "WED", label: "W" },
  { value: "THU", label: "T" },
  { value: "FRI", label: "F" },
  { value: "SAT", label: "S" },
  { value: "SUN", label: "S" },
];

/** JS Date.getDay() (0=Sun) → our Day enum, for matching logs to weekdays. */
export const JS_DAY_TO_ENUM: Day[] = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
];
