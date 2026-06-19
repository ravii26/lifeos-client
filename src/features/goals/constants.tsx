import type { ConfidenceLabel, GoalStatus } from "./types";

/** Shared by Goals and Projects (same enum). `dot`/`tone` are token classes. */
export const STATUSES: {
  value: GoalStatus;
  label: string;
  dot: string;
  tone: string;
}[] = [
  { value: "ACTIVE", label: "Active", dot: "bg-primary", tone: "text-primary" },
  { value: "PARKED", label: "Parked", dot: "bg-tx-3", tone: "text-tx-3" },
  { value: "COMPLETED", label: "Completed", dot: "bg-ok", tone: "text-ok" },
  { value: "PAUSED", label: "Paused", dot: "bg-warn", tone: "text-warn" },
  {
    value: "ABANDONED",
    label: "Abandoned",
    dot: "bg-tx-4",
    tone: "text-tx-4",
  },
];

export const STATUS_BY_VALUE = Object.fromEntries(
  STATUSES.map((s) => [s.value, s]),
) as Record<GoalStatus, (typeof STATUSES)[number]>;

/** Visual treatment for the confidence label (ring colour + copy). */
export const CONFIDENCE_BY_LABEL: Record<
  ConfidenceLabel,
  { label: string; tone: string; ring: string }
> = {
  ON_TRACK: { label: "On track", tone: "text-ok", ring: "stroke-ok" },
  AT_RISK: { label: "At risk", tone: "text-warn", ring: "stroke-warn" },
  OFF_TRACK: { label: "Off track", tone: "text-danger", ring: "stroke-danger" },
};

/** Human label for the weakest confidence driver. */
export const WEAKEST_LABEL: Record<string, string> = {
  habits: "Habits",
  tasks: "Tasks",
  momentum: "Momentum",
};
