export type CaptureType = "TASK" | "HABIT" | "NOTE" | "RESOURCE" | "VAULT";
export type CaptureStatus = "PENDING" | "CONVERTED" | "DISMISSED";
export type WorthCheck = "WORTH_NOW" | "SAVE_LATER" | "NOT_RELEVANT";
export type CaptureMediaType = "TEXT" | "IMAGE" | "AUDIO";

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
  // Input modality + stored media URL (for image/audio captures).
  mediaType?: CaptureMediaType;
  mediaUrl?: string | null;
  createdAt?: string;
}

// A capture is either typed text, or a media file (image/audio) with an
// optional caption. The API layer turns the media variant into multipart.
export interface CreateCaptureRequest {
  text?: string;
  file?: Blob;
  /** Filename to send with the blob (e.g. "voice.webm", "photo.png"). */
  fileName?: string;
}

export interface ConvertCaptureRequest {
  areaId?: string;
  topicId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}
