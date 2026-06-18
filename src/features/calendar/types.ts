export interface CalendarBlock {
  // For expanded occurrences this is a synthetic "<blockId>:<ISO>" — NOT a DB id.
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  blockType?: string | null; // free string, default "FOCUS"
  isActual?: boolean | null;
  notes?: string | null;
  taskId?: string | null;
  habitId?: string | null;
  areaId?: string | null;
  recurrenceRule?: string | null; // iCal RRULE, e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  isRecurring?: boolean;
  // Set ONLY on expanded occurrences → the template's real id.
  recurringBlockId?: string | null;
  // Set ONLY on occurrences → original start; the key for per-occurrence edits.
  occurrenceDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * If `recurringBlockId` is non-null the block is a generated occurrence — edits
 * must target `recurringBlockId` + `occurrenceDate`, never the synthetic `id`.
 */
export function isOccurrence(b: CalendarBlock): boolean {
  return b.recurringBlockId != null;
}

export interface CreateCalendarRequest {
  title: string;
  startTime: string;
  endTime: string;
  blockType?: string;
  isActual?: boolean;
  notes?: string;
  taskId?: string;
  habitId?: string;
  areaId?: string;
  recurrenceRule?: string; // omit → one-off block
}

// PATCH accepts any subset; nullable fields can be cleared with null.
export type UpdateCalendarRequest = Partial<{
  title: string;
  startTime: string;
  endTime: string;
  blockType: string;
  isActual: boolean;
  notes: string | null;
  taskId: string | null;
  habitId: string | null;
  areaId: string | null;
  recurrenceRule: string | null; // null → make it a one-off
}>;

/** Override or skip a single occurrence of a recurring series. */
export interface CalendarBlockException {
  id: string;
  blockId: string;
  occurrenceDate: string;
  isCancelled: boolean;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  blockType: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// PUT /calendar/:id/exceptions — :id is the recurring block's real id.
export interface UpsertExceptionRequest {
  occurrenceDate: string; // required: the occurrence's original start
  isCancelled?: boolean; // true → skip this occurrence
  title?: string;
  startTime?: string;
  endTime?: string;
  blockType?: string;
  notes?: string;
}

// POST /calendar/:id/split — "this and following".
export interface SplitSeriesRequest {
  fromOccurrenceDate: string; // required: where the new series begins
  startTime?: string;
  endTime?: string;
  title?: string;
  blockType?: string;
  notes?: string | null;
  taskId?: string | null;
  habitId?: string | null;
  areaId?: string | null;
  recurrenceRule?: string; // omit → keep original pattern
}

export interface SplitSeriesResponse {
  previous: CalendarBlock; // the capped original series
  following: CalendarBlock; // the new series
}
