export type CaptureType = "TASK" | "HABIT" | "NOTE" | "RESOURCE" | "VAULT";
export type CaptureStatus = "PENDING" | "CONVERTED" | "DISMISSED";
export type WorthCheck = "WORTH_NOW" | "SAVE_LATER" | "NOT_RELEVANT";

export interface CaptureMeta {
  title?: string | null;
  frequency?: "DAILY" | "WEEKLY" | "CUSTOM" | null;
  targetMinutes?: number | null;
  suggestedAreaId?: string | null;
  suggestedAreaName?: string | null;
  suggestedTopicId?: string | null;
  suggestedTopicName?: string | null;
  url?: string | null;
  platform?: string | null;
  resourceType?: string | null;
  tags?: string[] | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | null;
  dueDate?: string | null;
}

export interface Capture {
  id: string;
  text: string;
  type: CaptureType;
  // null until the background AI classification finishes (~1-2s after create).
  confidence: number | null;
  status: CaptureStatus;
  processed: boolean;
  detectedUrl?: string | null;
  // AI worth-triage — null until classified.
  worthCheck?: WorthCheck | null;
  worthReason?: string | null;
  meta?: CaptureMeta | null;
  createdAt?: string;
}

export interface CreateCaptureRequest {
  text: string;
}

export interface ConvertCaptureRequest {
  areaId?: string;
  topicId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}
