import { api } from "@/store/api";
import type { Priority } from "@/features/tasks/types";
import type {
  CreateGoalRequest,
  CreateProjectRequest,
  Goal,
  GoalBoard,
  GoalStatus,
  GoalWithConfidence,
  FocusState,
  Project,
  UpdateGoalRequest,
  UpdateProjectRequest,
} from "./types";

type GoalFilters = {
  areaId?: string;
  status?: GoalStatus;
  priority?: Priority;
  withConfidence?: boolean;
};
type ProjectFilters = { areaId?: string; goalId?: string; status?: GoalStatus };

// Mutations that change the focus set touch several goals at once, so they
// invalidate the whole list + the board snapshot rather than single ids.
const FOCUS_INVALIDATES = [
  { type: "Goal" as const, id: "LIST" },
  { type: "Goal" as const, id: "BOARD" },
];

export const goalsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // `withConfidence` widens the row type; callers pick the variant they pass.
    listGoals: builder.query<Goal[] | GoalWithConfidence[], GoalFilters | void>({
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

    // The focus screen in one call: active + parked + cap metadata.
    getGoalBoard: builder.query<GoalBoard, void>({
      query: () => ({ url: "/goals/board", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.active.map((g) => ({ type: "Goal" as const, id: g.id })),
              ...result.parked.map((g) => ({ type: "Goal" as const, id: g.id })),
              { type: "Goal" as const, id: "BOARD" },
            ]
          : [{ type: "Goal" as const, id: "BOARD" }],
    }),

    getGoal: builder.query<Goal, string>({
      query: (id) => ({ url: `/goals/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Goal", id }],
    }),

    getGoalConfidence: builder.query<GoalWithConfidence, string>({
      query: (id) => ({ url: `/goals/${id}/confidence`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Goal", id }],
    }),

    createGoal: builder.mutation<Goal, CreateGoalRequest>({
      query: (body) => ({ url: "/goals", method: "POST", data: body }),
      invalidatesTags: FOCUS_INVALIDATES,
    }),

    updateGoal: builder.mutation<Goal, { id: string; data: UpdateGoalRequest }>({
      query: ({ id, data }) => ({ url: `/goals/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Goal", id },
        ...FOCUS_INVALIDATES,
      ],
    }),

    // Hero focus action: activates this goal, optionally parking another to
    // make room. Server enforces the cap and does the atomic swap.
    activateGoal: builder.mutation<
      FocusState,
      { id: string; parkGoalId?: string }
    >({
      query: ({ id, parkGoalId }) => ({
        url: `/goals/${id}/activate`,
        method: "POST",
        // Always send a JSON body — the backend validator rejects an empty
        // request ("Validation failed"), so default to `{}` when not parking.
        data: parkGoalId ? { parkGoalId } : {},
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Goal", id },
        ...FOCUS_INVALIDATES,
      ],
    }),

    parkGoal: builder.mutation<FocusState, string>({
      query: (id) => ({ url: `/goals/${id}/park`, method: "POST", data: {} }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Goal", id },
        ...FOCUS_INVALIDATES,
      ],
    }),

    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({ url: `/goals/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Goal", id },
        ...FOCUS_INVALIDATES,
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
  useGetGoalBoardQuery,
  useGetGoalQuery,
  useGetGoalConfidenceQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useActivateGoalMutation,
  useParkGoalMutation,
  useDeleteGoalMutation,
  useListProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = goalsApi;
