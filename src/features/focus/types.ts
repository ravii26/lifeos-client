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

export interface StartFocusRequest {
  startedAt?: string;
  notes?: string;
  taskId?: string;
  habitId?: string;
  calendarBlockId?: string;
}
