export type HabitType = "BOOLEAN" | "COUNT" | "TIMER";
export type HabitFrequency = "DAILY" | "WEEKLY" | "CUSTOM";
export type Day = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface Habit {
  id: string;
  title: string;
  description?: string | null;
  areaId: string;
  habitType: HabitType;
  // Conditional on habitType: COUNT → targetCount, TIMER → targetMinutes.
  targetCount?: number | null;
  targetMinutes?: number | null;
  frequency: HabitFrequency;
  // Conditional on frequency: WEEKLY → weeklyTarget, CUSTOM → specificDays.
  weeklyTarget?: number | null;
  specificDays?: Day[] | null;
  reminderTime?: string | null; // "HH:MM"
  isActive: boolean;
  // Server-computed stats (B4 — inlined by GET /habits since backend update).
  currentStreak?: number | null;
  longestStreak?: number | null;
  todayDone?: boolean | null;
  todayLog?: { completed?: boolean; count?: number; minutes?: number } | null;
  history?: boolean[] | null; // 28-day completion booleans, oldest first
  createdAt?: string;
  updatedAt?: string;
}

/** One entry from GET /habits/:id/logs. `date` is a date-only field. */
export interface HabitLog {
  id: string;
  date: string; // date-only (YYYY-MM-DD) the log is for
  completed?: boolean | null;
  count?: number | null;
  minutes?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export interface CreateHabitRequest {
  title: string;
  areaId: string;
  description?: string;
  habitType?: HabitType;
  targetCount?: number;
  targetMinutes?: number;
  frequency?: HabitFrequency;
  weeklyTarget?: number;
  specificDays?: Day[];
  reminderTime?: string;
  isActive?: boolean;
}

export type UpdateHabitRequest = Partial<
  Omit<CreateHabitRequest, "areaId">
> & {
  areaId?: string;
  // Nullable fields may be set to null to clear them on the backend.
  description?: string | null;
  targetCount?: number | null;
  targetMinutes?: number | null;
  weeklyTarget?: number | null;
  specificDays?: Day[] | null;
  reminderTime?: string | null;
};
