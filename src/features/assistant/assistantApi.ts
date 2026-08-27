import { api } from "@/store/api";

export interface AssistantAskRequest {
  message: string;
  history?: { role: "user" | "assistant"; text: string }[];
}

export interface AssistantAskResult {
  answer: string;
  sources: {
    sourceType: "DOCUMENT" | "NOTE" | "RESOURCE";
    sourceId: string;
    sourceTitle: string;
    heading: string | null;
    snippet: string;
    score: number;
  }[];
  usedAi: boolean;
}

export const assistantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Each ask is a fresh, explicit exchange (no server-side thread yet —
    // Phase 1 is stateless by design), so a mutation, not a cached query.
    assistantAsk: builder.mutation<AssistantAskResult, AssistantAskRequest>({
      query: (body) => ({ url: "/assistant/ask", method: "POST", data: body }),
    }),
  }),
});

export const { useAssistantAskMutation } = assistantApi;
