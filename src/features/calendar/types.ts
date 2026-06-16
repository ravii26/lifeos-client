export interface CalendarBlock {
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
  createdAt?: string;
  updatedAt?: string;
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
}

export type UpdateCalendarRequest = Partial<CreateCalendarRequest>;
