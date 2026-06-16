import { api } from "@/store/api";
import type {
  CreateHabitRequest,
  Habit,
  HabitLog,
  UpdateHabitRequest,
} from "./types";

export const habitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listHabits: builder.query<Habit[], { isActive?: boolean } | void>({
      query: (params) => ({
        url: "/habits",
        method: "GET",
        ...(params && params.isActive != null
          ? { params: { isActive: params.isActive } }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((h) => ({ type: "Habit" as const, id: h.id })),
              { type: "Habit" as const, id: "LIST" },
            ]
          : [{ type: "Habit" as const, id: "LIST" }],
    }),

    createHabit: builder.mutation<Habit, CreateHabitRequest>({
      query: (body) => ({ url: "/habits", method: "POST", data: body }),
      invalidatesTags: [{ type: "Habit", id: "LIST" }],
    }),

    updateHabit: builder.mutation<
      Habit,
      { id: string; data: UpdateHabitRequest }
    >({
      query: ({ id, data }) => ({
        url: `/habits/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Habit", id },
        { type: "Habit", id: "LIST" },
      ],
    }),

    deleteHabit: builder.mutation<void, string>({
      query: (id) => ({ url: `/habits/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Habit", id },
        { type: "Habit", id: "LIST" },
      ],
    }),

    // Idempotent per date (upsert on habitId+date) — safe to repeat for "today".
    // count/minutes are only meaningful for COUNT/TIMER habits.
    logHabit: builder.mutation<
      HabitLog,
      {
        id: string;
        completed?: boolean;
        count?: number;
        minutes?: number;
        date?: string;
      }
    >({
      query: ({ id, completed, count, minutes, date }) => ({
        url: `/habits/${id}/log`,
        method: "POST",
        data: {
          completed: completed ?? true,
          ...(count != null ? { count } : {}),
          ...(minutes != null ? { minutes } : {}),
          ...(date ? { date } : {}),
        },
      }),
      // Refreshes both the habit (streak fields) and its log history.
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Habit", id },
        { type: "Habit", id: "LIST" },
        { type: "HabitLog", id },
      ],
    }),

    listHabitLogs: builder.query<HabitLog[], string>({
      query: (id) => ({ url: `/habits/${id}/logs`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "HabitLog", id }],
    }),
  }),
});

export const {
  useListHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useLogHabitMutation,
  useListHabitLogsQuery,
} = habitsApi;
