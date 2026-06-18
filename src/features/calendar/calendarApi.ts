import { api } from "@/store/api";
import type {
  CalendarBlock,
  CalendarBlockException,
  CreateCalendarRequest,
  SplitSeriesRequest,
  SplitSeriesResponse,
  UpdateCalendarRequest,
  UpsertExceptionRequest,
} from "./types";

type CalendarFilters = {
  from?: string;
  to?: string;
  areaId?: string;
  taskId?: string;
  habitId?: string;
};

export const calendarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listCalendar: builder.query<CalendarBlock[], CalendarFilters | void>({
      query: (filters) => ({
        url: "/calendar",
        method: "GET",
        ...(filters && Object.values(filters).some((v) => v)
          ? { params: filters }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: "Calendar" as const, id: b.id })),
              { type: "Calendar" as const, id: "LIST" },
            ]
          : [{ type: "Calendar" as const, id: "LIST" }],
    }),

    createCalendar: builder.mutation<CalendarBlock, CreateCalendarRequest>({
      query: (body) => ({ url: "/calendar", method: "POST", data: body }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }],
    }),

    updateCalendar: builder.mutation<
      CalendarBlock,
      { id: string; data: UpdateCalendarRequest }
    >({
      query: ({ id, data }) => ({
        url: `/calendar/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
      ],
    }),

    // Deletes the whole series + cascades its exceptions.
    deleteCalendar: builder.mutation<void, string>({
      query: (id) => ({ url: `/calendar/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
      ],
    }),

    // Override or skip ONE occurrence — "This event". `id` is the series' real id
    // (a block's `recurringBlockId`). Occurrence ids are synthetic, so we
    // re-fetch the whole range rather than try to patch a single cached item.
    upsertCalendarException: builder.mutation<
      CalendarBlockException,
      { id: string; data: UpsertExceptionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/calendar/${id}/exceptions`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
      ],
    }),

    // Revert one occurrence to the series default.
    deleteCalendarException: builder.mutation<
      void,
      { id: string; occurrenceDate: string }
    >({
      query: ({ id, occurrenceDate }) => ({
        url: `/calendar/${id}/exceptions`,
        method: "DELETE",
        params: { occurrenceDate },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
      ],
    }),

    // Split a series — "This and following". `id` is the series' real id.
    splitCalendarSeries: builder.mutation<
      SplitSeriesResponse,
      { id: string; data: SplitSeriesRequest }
    >({
      query: ({ id, data }) => ({
        url: `/calendar/${id}/split`,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Calendar", id: "LIST" }],
    }),
  }),
});

export const {
  useListCalendarQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useUpsertCalendarExceptionMutation,
  useDeleteCalendarExceptionMutation,
  useSplitCalendarSeriesMutation,
} = calendarApi;
