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

// AI narrative attached to an auto-drafted review.
export interface ReviewAiInsights {
  narrative: string;
  observations: string[];
  source: "ai" | "heuristic";
}

// GET /reviews/draft — factual period stats + pre-filled editable text + AI
// narrative. The user edits, then saves via POST /reviews.
export interface ReviewDraft {
  reviewType: ReviewType;
  periodStart: string;
  periodEnd: string;
  stats: {
    tasksCompleted: number;
    habitsLogged: number;
    focusMinutes: number;
    topStreaks: { title: string; streak: number }[];
    areaScores: { name: string; score: number }[];
    activeGoals: { title: string; confidence: number; label: string }[];
  };
  suggestedSummary: string;
  suggestedHighlights: string;
  suggestedImprovements: string;
  aiInsights: ReviewAiInsights;
}

export interface CreateReviewRequest {
  reviewType: ReviewType;
  periodStart: string;
  periodEnd: string;
  summary?: string;
  highlights?: string;
  improvements?: string;
  userNote?: string;
  // Carried over from a generated draft so the AI narrative persists.
  aiInsights?: ReviewAiInsights;
}
// aiInsights is set only at create-time from a draft; never part of an update.
export type UpdateReviewRequest = Partial<Omit<CreateReviewRequest, "aiInsights">>;

export interface CreateInsightRequest {
  noteId: string;
  status?: InsightStatus;
  userNote?: string;
}
export interface UpdateInsightRequest {
  status?: InsightStatus;
  userNote?: string;
}
