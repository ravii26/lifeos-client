export type DocumentStatus = "PENDING" | "READY" | "FAILED";
export type DocumentSourceType = "PASTED" | "UPLOADED";

export interface LibraryDocument {
  id: string;
  title: string;
  sourceType: DocumentSourceType;
  status: DocumentStatus;
  chunkCount: number;
  topicId: string | null;
  notebookId: string | null;
  error: string | null;
  createdAt: string;
}

export interface CreateDocumentRequest {
  title?: string;
  text?: string;
  // When present the document is uploaded as multipart (.txt/.md); otherwise
  // `text` is sent as JSON.
  file?: File;
  fileName?: string;
}

export type AskSourceType = "DOCUMENT" | "NOTE" | "RESOURCE";

export interface AskSource {
  sourceType: AskSourceType;
  sourceId: string;
  sourceTitle: string;
  heading: string | null;
  snippet: string;
  score: number;
}

export interface AskResult {
  answer: string;
  sources: AskSource[];
  // false when no AI was available and the best-matching passage was returned
  // verbatim instead of a synthesised answer.
  usedAi: boolean;
}

export interface AskRequest {
  question: string;
  // Omit to search everything (documents, notes, resources); set to scope the
  // answer to one document only.
  documentId?: string;
}

// ── Phase 2: AI-extracted actions ────────────────────────────────────────────

export type SuggestionItemType = "HABIT" | "GOAL" | "TASK";
export type SuggestionStatus = "PENDING" | "ACCEPTED" | "DISMISSED";

export interface Suggestion {
  id: string;
  documentId: string;
  itemType: SuggestionItemType;
  title: string;
  detail: string | null;
  confidence: number;
  status: SuggestionStatus;
  sourceHeading: string | null;
  suggestedAreaId: string | null;
  suggestedAreaName: string | null;
  frequency: string | null;
  targetMinutes: number | null;
  priority: string | null;
  dueDate: string | null;
  createdEntity: { type: string; id: string } | null;
}

export interface AcceptSuggestionRequest {
  id: string;
  documentId: string; // for cache invalidation only
  areaId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

