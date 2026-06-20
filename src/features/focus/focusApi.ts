import { api } from "@/store/api";
import type {
  DailyFocusBucket,
  FocusSession,
  StartFocusRequest,
} from "./types";

type FocusFilters = {
  from?: string;
  to?: string;
  taskId?: string;
  habitId?: string;
};

export const focusApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listFocus: builder.query<FocusSession[], FocusFilters | void>({
      query: (filters) => ({
        url: "/focus",
        method: "GET",
        ...(filters && Object.values(filters).some((v) => v)
          ? { params: filters }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((f) => ({ type: "Focus" as const, id: f.id })),
              { type: "Focus" as const, id: "LIST" },
            ]
          : [{ type: "Focus" as const, id: "LIST" }],
    }),

    // Per-day focus minutes with midnight-crossing sessions split correctly.
    // Defaults server-side to the last 7 days when from/to are omitted.
    dailyFocus: builder.query<DailyFocusBucket[], FocusFilters | void>({
      query: (filters) => ({
        url: "/focus/daily",
        method: "GET",
        ...(filters && Object.values(filters).some((v) => v)
          ? { params: filters }
          : {}),
      }),
      providesTags: [{ type: "Focus", id: "DAILY" }],
    }),

    startFocus: builder.mutation<FocusSession, StartFocusRequest | void>({
      query: (body) => ({ url: "/focus", method: "POST", data: body ?? {} }),
      invalidatesTags: [
        { type: "Focus", id: "LIST" },
        { type: "Focus", id: "DAILY" },
      ],
    }),

    // NOT idempotent — server 409s if already stopped. Disable Stop after use.
    stopFocus: builder.mutation<FocusSession, string>({
      query: (id) => ({ url: `/focus/${id}/stop`, method: "PATCH" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Focus", id },
        { type: "Focus", id: "LIST" },
        { type: "Focus", id: "DAILY" },
      ],
    }),
  }),
});

export const {
  useListFocusQuery,
  useDailyFocusQuery,
  useStartFocusMutation,
  useStopFocusMutation,
} = focusApi;
