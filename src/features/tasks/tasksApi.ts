import { api } from "@/store/api";
import type {
  Task,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "./types";

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listTasks: builder.query<Task[], { status?: TaskStatus } | void>({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        ...(params && params.status
          ? { params: { status: params.status } }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Task" as const, id: t.id })),
              { type: "Task" as const, id: "LIST" },
            ]
          : [{ type: "Task" as const, id: "LIST" }],
    }),

    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({ url: "/tasks", method: "POST", data: body }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<Task, { id: string; data: UpdateTaskRequest }>({
      query: ({ id, data }) => ({ url: `/tasks/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    // Dedicated endpoint that sets status COMPLETED + completedAt server-side.
    completeTask: builder.mutation<Task, string>({
      query: (id) => ({ url: `/tasks/${id}/complete`, method: "PATCH" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCompleteTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
