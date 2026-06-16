import { api } from "@/store/api";
import type {
  CreateGoalRequest,
  CreateProjectRequest,
  Goal,
  GoalStatus,
  Project,
  UpdateGoalRequest,
  UpdateProjectRequest,
} from "./types";

type GoalFilters = { areaId?: string; status?: GoalStatus };
type ProjectFilters = { areaId?: string; goalId?: string; status?: GoalStatus };

export const goalsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGoals: builder.query<Goal[], GoalFilters | void>({
      query: (filters) => ({
        url: "/goals",
        method: "GET",
        ...(filters && Object.keys(filters).length
          ? { params: filters }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((g) => ({ type: "Goal" as const, id: g.id })),
              { type: "Goal" as const, id: "LIST" },
            ]
          : [{ type: "Goal" as const, id: "LIST" }],
    }),

    createGoal: builder.mutation<Goal, CreateGoalRequest>({
      query: (body) => ({ url: "/goals", method: "POST", data: body }),
      invalidatesTags: [{ type: "Goal", id: "LIST" }],
    }),

    updateGoal: builder.mutation<Goal, { id: string; data: UpdateGoalRequest }>({
      query: ({ id, data }) => ({ url: `/goals/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Goal", id },
        { type: "Goal", id: "LIST" },
      ],
    }),

    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({ url: `/goals/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Goal", id },
        { type: "Goal", id: "LIST" },
        // A goal's projects may be reparented/removed server-side.
        { type: "Project", id: "LIST" },
      ],
    }),

    listProjects: builder.query<Project[], ProjectFilters | void>({
      query: (filters) => ({
        url: "/projects",
        method: "GET",
        ...(filters && Object.keys(filters).length
          ? { params: filters }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Project" as const, id: p.id })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),

    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({ url: "/projects", method: "POST", data: body }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),

    updateProject: builder.mutation<
      Project,
      { id: string; data: UpdateProjectRequest }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Project", id },
        { type: "Project", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useListProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = goalsApi;
