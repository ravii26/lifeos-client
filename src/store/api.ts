import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/api/axiosBaseQuery";

/**
 * The single RTK Query "base API".
 *
 * Every feature (auth, areas, tasks…) plugs its own endpoints into this
 * via `api.injectEndpoints(...)`, so we keep one cache, one middleware,
 * one set of hooks — but the endpoint code stays co-located per feature.
 *
 * `tagTypes` are labels used for cache invalidation: a query can "provide"
 * a tag and a mutation can "invalidate" it, which makes RTK Query refetch
 * the affected data automatically (e.g. creating a Task invalidates "Task").
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "Area",
    "Task",
    "Habit",
    "HabitLog",
    "Goal",
    "Project",
    "Topic",
    "Notebook",
    "Resource",
    "Note",
    "Vault",
    "Review",
    "Insight",
    "Calendar",
    "Focus",
    "Identity",
    "Capture",
    "AreaSnapshot",
    "Settings",
    "Decision",
    "Graph",
    "Link",
    "Document",
    "Suggestion",
  ],
  endpoints: () => ({}),
});
