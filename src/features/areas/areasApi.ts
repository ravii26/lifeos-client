import { api } from "@/store/api";
import { normalizeAreaColor } from "./constants";
import type { Area, AreaScoreSnapshot, AreaTrendsResult, CreateAreaRequest, UpdateAreaRequest } from "./types";

/**
 * Cache-tag strategy (the key RTK Query concept):
 * - `listAreas` PROVIDES a tag per area + a special {id:'LIST'} tag.
 * - mutations INVALIDATE those tags, so RTK Query automatically refetches
 *   the list after a create/update/delete. No manual refresh anywhere.
 */
export const areasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAreas: builder.query<Area[], void>({
      query: () => ({ url: "/areas", method: "GET" }),
      // Legacy accounts may hold pre-redesign neon colors — normalize once
      // here so every consumer renders the print-ink palette.
      transformResponse: (areas: Area[]) =>
        areas.map((a) => ({ ...a, color: normalizeAreaColor(a.color) })),
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Area" as const, id: a.id })),
              { type: "Area" as const, id: "LIST" },
            ]
          : [{ type: "Area" as const, id: "LIST" }],
    }),

    createArea: builder.mutation<Area, CreateAreaRequest>({
      query: (body) => ({ url: "/areas", method: "POST", data: body }),
      invalidatesTags: [{ type: "Area", id: "LIST" }],
    }),

    updateArea: builder.mutation<Area, { id: string; data: UpdateAreaRequest }>({
      query: ({ id, data }) => ({ url: `/areas/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Area", id },
        { type: "Area", id: "LIST" },
      ],
    }),

    deleteArea: builder.mutation<void, string>({
      query: (id) => ({ url: `/areas/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Area", id },
        { type: "Area", id: "LIST" },
      ],
    }),

    // A3 — area score snapshots
    snapshotAreaScore: builder.mutation<AreaScoreSnapshot, string>({
      query: (id) => ({ url: `/areas/${id}/snapshot`, method: "POST" }),
      invalidatesTags: (_res, _err, id) => [{ type: "AreaSnapshot", id }],
    }),

    listAreaSnapshots: builder.query<AreaScoreSnapshot[], { id: string; limit?: number }>({
      query: ({ id, limit = 30 }) => ({
        url: `/areas/${id}/snapshots`,
        method: "GET",
        params: { limit },
      }),
      providesTags: (_res, _err, { id }) => [{ type: "AreaSnapshot", id }],
    }),

    getAreaTrends: builder.query<AreaTrendsResult, void>({
      query: () => ({ url: "/areas/trends", method: "GET" }),
      providesTags: [{ type: "AreaSnapshot", id: "TRENDS" }],
    }),
  }),
});

export const {
  useListAreasQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useSnapshotAreaScoreMutation,
  useListAreaSnapshotsQuery,
  useGetAreaTrendsQuery,
} = areasApi;
