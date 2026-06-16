import { api } from "@/store/api";
import type {
  CalendarBlock,
  CreateCalendarRequest,
  UpdateCalendarRequest,
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

    deleteCalendar: builder.mutation<void, string>({
      query: (id) => ({ url: `/calendar/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Calendar", id },
        { type: "Calendar", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListCalendarQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
} = calendarApi;
