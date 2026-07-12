import { api } from "@/store/api";
import type {
  AcceptSuggestionRequest,
  AskRequest,
  AskResult,
  CreateDocumentRequest,
  LibraryDocument,
  Suggestion,
} from "./types";

export const libraryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listDocuments: builder.query<LibraryDocument[], void>({
      query: () => ({ url: "/documents", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: "Document" as const, id: d.id })),
              { type: "Document" as const, id: "LIST" },
            ]
          : [{ type: "Document" as const, id: "LIST" }],
    }),

    getDocument: builder.query<LibraryDocument, string>({
      query: (id) => ({ url: `/documents/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Document" as const, id }],
    }),

    createDocument: builder.mutation<LibraryDocument, CreateDocumentRequest>({
      query: ({ title, text, file, fileName }) => {
        // Uploaded file → multipart. Axios sets the boundary header itself when
        // the body is FormData.
        if (file) {
          const form = new FormData();
          form.append("file", file, fileName ?? "document");
          if (title) form.append("title", title);
          return { url: "/documents", method: "POST", data: form };
        }
        return { url: "/documents", method: "POST", data: { title, text } };
      },
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),

    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({ url: `/documents/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Document", id },
        { type: "Document", id: "LIST" },
      ],
    }),

    // Q&A over the user's documents. A mutation (not a query) because each ask
    // is an explicit action with a fresh result, not cached derived state.
    ask: builder.mutation<AskResult, AskRequest>({
      query: (body) => ({ url: "/documents/ask", method: "POST", data: body }),
    }),

    // ── Phase 2: extract & review actions ────────────────────────────────────

    listSuggestions: builder.query<Suggestion[], string>({
      query: (documentId) => ({
        url: `/documents/${documentId}/suggestions`,
        method: "GET",
      }),
      providesTags: (_res, _err, documentId) => [
        { type: "Suggestion" as const, id: documentId },
      ],
    }),

    extractActions: builder.mutation<Suggestion[], string>({
      query: (documentId) => ({
        url: `/documents/${documentId}/extract`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, documentId) => [
        { type: "Suggestion", id: documentId },
      ],
    }),

    acceptSuggestion: builder.mutation<Suggestion, AcceptSuggestionRequest>({
      query: ({ id, areaId, priority }) => ({
        url: `/documents/suggestions/${id}/accept`,
        method: "POST",
        data: { ...(areaId ? { areaId } : {}), ...(priority ? { priority } : {}) },
      }),
      // Refresh the suggestion list and every module the accept could add to.
      invalidatesTags: (_res, _err, { documentId }) => [
        { type: "Suggestion", id: documentId },
        { type: "Task", id: "LIST" },
        { type: "Habit", id: "LIST" },
        { type: "Goal", id: "LIST" },
      ],
    }),

    dismissSuggestion: builder.mutation<void, { id: string; documentId: string }>({
      query: ({ id }) => ({
        url: `/documents/suggestions/${id}/dismiss`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, { documentId }) => [
        { type: "Suggestion", id: documentId },
      ],
    }),
  }),
});

export const {
  useListDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useAskMutation,
  useListSuggestionsQuery,
  useExtractActionsMutation,
  useAcceptSuggestionMutation,
  useDismissSuggestionMutation,
} = libraryApi;
