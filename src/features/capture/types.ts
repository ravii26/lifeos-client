export type CaptureType = "TASK" | "HABIT" | "NOTE" | "RESOURCE" | "VAULT";
export type CaptureStatus = "PENDING" | "CONVERTED" | "DISMISSED";

export interface Capture {
  id: string;
  text: string;
  type: CaptureType;
  confidence: number; // 0–1
  status: CaptureStatus;
  processed: boolean;
  detectedUrl?: string | null;
  meta?: Record<string, unknown> | null;
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
