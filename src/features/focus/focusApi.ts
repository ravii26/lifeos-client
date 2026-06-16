import { api } from "@/store/api";
import type { FocusSession, StartFocusRequest } from "./types";

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

    startFocus: builder.mutation<FocusSession, StartFocusRequest | void>({
      query: (body) => ({ url: "/focus", method: "POST", data: body ?? {} }),
      invalidatesTags: [{ type: "Focus", id: "LIST" }],
    }),

    // NOT idempotent — server 409s if already stopped. Disable Stop after use.
    stopFocus: builder.mutation<FocusSession, string>({
      query: (id) => ({ url: `/focus/${id}/stop`, method: "PATCH" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Focus", id },
        { type: "Focus", id: "LIST" },
      ],
    }),
  }),
});

export const { useListFocusQuery, useStartFocusMutation, useStopFocusMutation } =
  focusApi;
