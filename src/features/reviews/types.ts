export type ReviewType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type InsightStatus =
  | "PENDING"
  | "IMPLEMENTED"
  | "STILL_WORKING"
  | "NOT_APPLICABLE";

export interface Review {
  id: string;
  reviewType: ReviewType;
  periodStart: string;
  periodEnd: string;
  summary?: string | null;
  highlights?: string | null;
  improvements?: string | null;
  userNote?: string | null;
  // Read-only — AI-generated, never send.
  aiInsights?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsightReview {
  id: string;
  reviewId: string;
  noteId: string;
  status?: InsightStatus | null;
  userNote?: string | null;
  // Optionally embedded by the API for display; fall back to noteId.
  note?: { id: string; title: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  reviewType: ReviewType;
  periodStart: string;
  periodEnd: string;
  summary?: string;
  highlights?: string;
  improvements?: string;
  userNote?: string;
}
export type UpdateReviewRequest = Partial<CreateReviewRequest>;

export interface CreateInsightRequest {
  noteId: string;
  status?: InsightStatus;
  userNote?: string;
}
export interface UpdateInsightRequest {
  status?: InsightStatus;
  userNote?: string;
}
