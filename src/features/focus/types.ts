export interface FocusSession {
  id: string;
  startedAt: string;
  // Read-only — server sets these on /stop.
  endedAt?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
  taskId?: string | null;
  habitId?: string | null;
  calendarBlockId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// One row from GET /focus/daily. Sessions crossing midnight are split across
// days server-side, so `minutes` is the in-range focus for that UTC day.
// Zero-focus days are omitted — fill gaps client-side when charting a range.
export interface DailyFocusBucket {
  date: string; // YYYY-MM-DD (UTC)
  minutes: number;
}

export interface StartFocusRequest {
  startedAt?: string;
  notes?: string;
  taskId?: string;
  habitId?: string;
  calendarBlockId?: string;
}
