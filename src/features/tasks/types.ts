export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskType = "BOOLEAN" | "COUNT" | "TIMER";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recurrence = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: Priority | null;
  taskType: TaskType;
  targetCount?: number | null;
  completedCount?: number | null;
  targetMinutes?: number | null;
  dueDate?: string | null;
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
  source?: string | null;
  areaId?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  areaId?: string;
  goalId?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  taskType?: TaskType;
  // Conditional on taskType: COUNT → targetCount, TIMER → targetMinutes.
  targetCount?: number;
  targetMinutes?: number;
  dueDate?: string;
  isRecurring?: boolean;
  // Conditional on isRecurring.
  recurrence?: Recurrence;
  // Provenance (B6): set when converting from a note/capture.
  source?: "MANUAL" | "DUMP" | "LEARN";
  sourceId?: string;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;
