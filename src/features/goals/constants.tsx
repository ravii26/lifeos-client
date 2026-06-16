import type { GoalStatus } from "./types";

/** Shared by Goals and Projects (same enum). `dot`/`tone` are token classes. */
export const STATUSES: {
  value: GoalStatus;
  label: string;
  dot: string;
  tone: string;
}[] = [
  { value: "ACTIVE", label: "Active", dot: "bg-primary", tone: "text-primary" },
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
