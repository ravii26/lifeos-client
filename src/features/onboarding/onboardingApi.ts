import { api } from "@/store/api";
import type { OnboardingExtraction } from "./types";

export const onboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // A mutation, not a query — each call is an explicit "generate a fresh
    // proposal" action, same reasoning as Library's `ask`.
    extractOnboarding: builder.mutation<OnboardingExtraction, string>({
      query: (text) => ({ url: "/onboarding/extract", method: "POST", data: { text } }),
    }),
  }),
});

export const { useExtractOnboardingMutation } = onboardingApi;
