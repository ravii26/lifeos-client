import { api } from "@/store/api";
import type {
  CreateNoteRequest,
  CreateNotebookRequest,
  CreateResourceRequest,
  CreateTopicRequest,
  MasteryLevel,
  Note,
  NoteType,
  Notebook,
  Resource,
  ResourceStatus,
  ResourceType,
  Topic,
  UpdateNoteRequest,
  UpdateNotebookRequest,
  UpdateResourceProgressRequest,
  UpdateResourceRequest,
  UpdateTopicRequest,
} from "./types";

const withParams = (filters?: Record<string, unknown>) =>
  filters && Object.values(filters).some((v) => v != null && v !== "")
    ? { params: filters }
    : {};

export const knowledgeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ── Topics ──────────────────────────────────────────────
    listTopics: builder.query<
      Topic[],
      { areaId?: string; masteryLevel?: MasteryLevel } | void
    >({
      query: (filters) => ({
        url: "/topics",
        method: "GET",
        ...withParams(filters ?? undefined),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Topic" as const, id: t.id })),
              { type: "Topic" as const, id: "LIST" },
            ]
          : [{ type: "Topic" as const, id: "LIST" }],
    }),
    getTopic: builder.query<Topic, string>({
      query: (id) => ({ url: `/topics/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Topic", id }],
    }),
    createTopic: builder.mutation<Topic, CreateTopicRequest>({
      query: (body) => ({ url: "/topics", method: "POST", data: body }),
      invalidatesTags: [{ type: "Topic", id: "LIST" }],
    }),
    updateTopic: builder.mutation<
      Topic,
      { id: string; data: UpdateTopicRequest }
    >({
      query: ({ id, data }) => ({ url: `/topics/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Topic", id },
        { type: "Topic", id: "LIST" },
      ],
    }),
    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({ url: `/topics/${id}`, method: "DELETE" }),
      // Topic delete cascades to its children.
      invalidatesTags: (_res, _err, id) => [
        { type: "Topic", id },
        { type: "Topic", id: "LIST" },
        { type: "Notebook", id: "LIST" },
        { type: "Resource", id: "LIST" },
        { type: "Note", id: "LIST" },
      ],
    }),

    // ── Notebooks ───────────────────────────────────────────
    listNotebooks: builder.query<Notebook[], { topicId: string }>({
      query: ({ topicId }) => ({
        url: "/notebooks",
        method: "GET",
        params: { topicId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((n) => ({ type: "Notebook" as const, id: n.id })),
              { type: "Notebook" as const, id: "LIST" },
            ]
          : [{ type: "Notebook" as const, id: "LIST" }],
    }),
    createNotebook: builder.mutation<Notebook, CreateNotebookRequest>({
      query: (body) => ({ url: "/notebooks", method: "POST", data: body }),
      invalidatesTags: [{ type: "Notebook", id: "LIST" }],
    }),
    updateNotebook: builder.mutation<
      Notebook,
      { id: string; data: UpdateNotebookRequest }
    >({
      query: ({ id, data }) => ({
        url: `/notebooks/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Notebook", id },
        { type: "Notebook", id: "LIST" },
      ],
    }),
    deleteNotebook: builder.mutation<void, string>({
      query: (id) => ({ url: `/notebooks/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Notebook", id },
        { type: "Notebook", id: "LIST" },
      ],
    }),

    // ── Resources ───────────────────────────────────────────
    listResources: builder.query<
      Resource[],
      { topicId: string; resourceType?: ResourceType; status?: ResourceStatus }
    >({
      query: (filters) => ({
        url: "/resources",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: "Resource" as const, id: r.id })),
              { type: "Resource" as const, id: "LIST" },
            ]
          : [{ type: "Resource" as const, id: "LIST" }],
    }),
    createResource: builder.mutation<Resource, CreateResourceRequest>({
      query: (body) => ({ url: "/resources", method: "POST", data: body }),
      invalidatesTags: [{ type: "Resource", id: "LIST" }],
    }),
    updateResource: builder.mutation<
      Resource,
      { id: string; data: UpdateResourceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/resources/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Resource", id },
        { type: "Resource", id: "LIST" },
      ],
    }),
    deleteResource: builder.mutation<void, string>({
      query: (id) => ({ url: `/resources/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Resource", id },
        { type: "Resource", id: "LIST" },
      ],
    }),

    // B8 — resource progress
    updateResourceProgress: builder.mutation<
      Resource,
      { id: string; data: UpdateResourceProgressRequest }
    >({
      query: ({ id, data }) => ({
        url: `/resources/${id}/progress`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Resource", id },
        { type: "Resource", id: "LIST" },
      ],
    }),

    // ── Notes ───────────────────────────────────────────────
    getNote: builder.query<Note, string>({
      query: (id) => ({ url: `/notes/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Note", id }],
    }),
    listNotes: builder.query<
      Note[],
      {
        topicId: string;
        notebookId?: string;
        resourceId?: string;
        noteType?: NoteType;
      }
    >({
      query: (filters) => ({ url: "/notes", method: "GET", params: filters }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((n) => ({ type: "Note" as const, id: n.id })),
              { type: "Note" as const, id: "LIST" },
            ]
          : [{ type: "Note" as const, id: "LIST" }],
    }),
    createNote: builder.mutation<Note, CreateNoteRequest>({
      query: (body) => ({ url: "/notes", method: "POST", data: body }),
      invalidatesTags: [{ type: "Note", id: "LIST" }],
    }),
    updateNote: builder.mutation<Note, { id: string; data: UpdateNoteRequest }>({
      query: ({ id, data }) => ({ url: `/notes/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
      ],
    }),
    deleteNote: builder.mutation<void, string>({
      query: (id) => ({ url: `/notes/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Note", id },
        { type: "Note", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListTopicsQuery,
  useGetTopicQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useListNotebooksQuery,
  useCreateNotebookMutation,
  useUpdateNotebookMutation,
  useDeleteNotebookMutation,
  useListResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useUpdateResourceProgressMutation,
  useGetNoteQuery,
  useListNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = knowledgeApi;
