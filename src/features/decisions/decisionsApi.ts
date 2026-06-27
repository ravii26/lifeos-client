import { api } from "@/store/api";

export type SuggestionType =
  | "TASK"
  | "HABIT"
  | "AREA_FOCUS"
  | "REVIEW"
  | "GOAL"
  | "PROJECT"
  | "CAPTURE"
  | "RESOURCE"
  | "VAULT"
  | "NOTE";
export type Urgency = "HIGH" | "MEDIUM" | "LOW";

export interface DecisionSuggestion {
  rank: number;
  type: SuggestionType;
  refId: string | null;
  title: string;
  reason: string;
  urgency: Urgency;
  actionableSteps?: string[];
}

export interface StreakAlert {
  habitId: string;
  title: string;
  streakDays: number;
  message: string;
}

// Drives hero card theming. Treat any unknown value as "neutral" for
// forward-safety.
export type Tone = "encouraging" | "firm" | "celebratory" | "neutral";

// The single thing to do now — rendered as the hero CTA.
// refId always equals suggestions[0].refId, so the CTA and the top of the
// list deep-link to the same entity. REVIEW has a null refId (open composer).
export interface PrimaryAction {
  type: SuggestionType;
  refId: string | null;
  title: string;
  why: string;
  estimatedMinutes: number | null;
}

export interface DecisionResult {
  // Coach layer — present on both "ai" and "heuristic" sources.
  headline: string;
  briefing: string;
  tone: Tone;
  // null when there's nothing to do — render the empty/celebration state.
  primaryAction: PrimaryAction | null;
  suggestions: DecisionSuggestion[];
  neglectedArea: {
    id: string;
    name: string;
    score: number;
    insight: string;
  } | null;
  todayFocus: string;
  behaviorInsight: string;
  weeklyPattern?: string;
  streakAlerts?: StreakAlert[];
  generatedAt: string;
  source: "ai" | "heuristic";
}

export const decisionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDecisionsNow: builder.query<DecisionResult, void>({
      query: () => ({ url: "/decisions/now", method: "GET" }),
      providesTags: [{ type: "Decision", id: "NOW" }],
    }),
  }),
});

export const { useGetDecisionsNowQuery } = decisionsApi;
