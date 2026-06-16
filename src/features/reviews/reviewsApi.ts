import { api } from "@/store/api";
import type {
  CreateInsightRequest,
  CreateReviewRequest,
  InsightReview,
  Review,
  ReviewType,
  UpdateInsightRequest,
  UpdateReviewRequest,
} from "./types";

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listReviews: builder.query<Review[], { reviewType?: ReviewType } | void>({
      query: (filters) => ({
        url: "/reviews",
        method: "GET",
        ...(filters && filters.reviewType
          ? { params: { reviewType: filters.reviewType } }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Review" as const, id: r.id })),
              { type: "Review" as const, id: "LIST" },
            ]
          : [{ type: "Review" as const, id: "LIST" }],
    }),
    getReview: builder.query<Review, string>({
      query: (id) => ({ url: `/reviews/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Review", id }],
    }),
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (body) => ({ url: "/reviews", method: "POST", data: body }),
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),
    updateReview: builder.mutation<
      Review,
      { id: string; data: UpdateReviewRequest }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Review", id },
        { type: "Review", id: "LIST" },
      ],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Review", id },
        { type: "Review", id: "LIST" },
      ],
    }),

    // ── Insights (nested under a review) ────────────────────
    listInsights: builder.query<InsightReview[], string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/insights`,
        method: "GET",
      }),
      providesTags: (result, _err, reviewId) =>
        result
          ? [
              ...result.map((i) => ({ type: "Insight" as const, id: i.id })),
              { type: "Insight" as const, id: `REVIEW-${reviewId}` },
            ]
          : [{ type: "Insight" as const, id: `REVIEW-${reviewId}` }],
    }),
    addInsight: builder.mutation<
      InsightReview,
      { reviewId: string; data: CreateInsightRequest }
    >({
      query: ({ reviewId, data }) => ({
        url: `/reviews/${reviewId}/insights`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_res, _err, { reviewId }) => [
        { type: "Insight", id: `REVIEW-${reviewId}` },
      ],
    }),
    // Standalone routes — keyed by insightId, not nested.
    updateInsight: builder.mutation<
      InsightReview,
      { insightId: string; reviewId: string; data: UpdateInsightRequest }
    >({
      query: ({ insightId, data }) => ({
        url: `/insights/${insightId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { insightId, reviewId }) => [
        { type: "Insight", id: insightId },
        { type: "Insight", id: `REVIEW-${reviewId}` },
      ],
    }),
    deleteInsight: builder.mutation<
      void,
      { insightId: string; reviewId: string }
    >({
      query: ({ insightId }) => ({
        url: `/insights/${insightId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { insightId, reviewId }) => [
        { type: "Insight", id: insightId },
        { type: "Insight", id: `REVIEW-${reviewId}` },
      ],
    }),
  }),
});

export const {
  useListReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useListInsightsQuery,
  useAddInsightMutation,
  useUpdateInsightMutation,
  useDeleteInsightMutation,
} = reviewsApi;
