import { api } from "@/store/api";

/** Totals for one period, feature, model, user or day. Cost only counts priced models. */
export interface AiTotals {
  calls: number;
  failures: number;
  tokensIn: number;
  tokensOut: number;
  costInr: number;
  unpricedCalls: number;
  avgMs: number;
}

export interface AiSummary {
  today: AiTotals;
  last7Days: AiTotals;
  last30Days: AiTotals;
  byFeature: (AiTotals & { feature: string })[];
  byModel: (AiTotals & { provider: string; model: string })[];
  byUser: (AiTotals & { userId: string | null; email: string })[];
  byDay: (AiTotals & { day: string })[];
  unpricedModels: string[];
  usdInr: number;
  truncated: boolean;
}

export interface AiCall {
  id: string;
  email: string | null;
  feature: string;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
  ok: boolean;
  error: string | null;
  createdAt: string;
}

export interface AdminSave {
  id: string;
  email: string | null;
  title: string;
  url: string | null;
  source: "YouTube" | "Instagram" | "link" | "text";
  purpose: string | null;
  status: string;
  summaryState: string | null;
  made: { tasks: number; habits: number; note: boolean; shelf: boolean };
  createdAt: string;
}

export interface AdminOverview {
  users: number;
  newUsers: number;
  activeThisWeek: number;
  upcomingReminders: number;
  savesThisWeek: number;
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    adminOverview: builder.query<AdminOverview, void>({
      query: () => ({ url: "/admin/overview", method: "GET" }),
    }),
    adminAiSummary: builder.query<AiSummary, void>({
      query: () => ({ url: "/admin/ai/summary", method: "GET" }),
    }),
    adminAiCalls: builder.query<AiCall[], { failures?: boolean; limit?: number }>({
      query: ({ failures, limit }) => ({ url: "/admin/ai/calls", method: "GET", params: { failures, limit } }),
    }),
    adminSaves: builder.query<AdminSave[], void>({
      query: () => ({ url: "/admin/saves", method: "GET" }),
    }),
  }),
});

export const { useAdminOverviewQuery, useAdminAiSummaryQuery, useAdminAiCallsQuery, useAdminSavesQuery } = adminApi;
