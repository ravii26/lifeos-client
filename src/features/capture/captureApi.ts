import { api } from "@/store/api";
import type {
  Capture,
  CaptureType,
  ConvertCaptureRequest,
  CreateCaptureRequest,
} from "./types";

export const captureApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCapture: builder.query<Capture, string>({
      query: (id) => ({ url: `/captures/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Capture" as const, id }],
    }),

    listCaptures: builder.query<Capture[], { processed?: boolean } | void>({
      query: (params) => ({
        url: "/captures",
        method: "GET",
        ...(params && params.processed != null
          ? { params: { processed: params.processed } }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Capture" as const, id: c.id })),
              { type: "Capture" as const, id: "LIST" },
            ]
          : [{ type: "Capture" as const, id: "LIST" }],
    }),

    createCapture: builder.mutation<Capture, CreateCaptureRequest>({
      query: (body) => ({ url: "/captures", method: "POST", data: body }),
      invalidatesTags: [{ type: "Capture", id: "LIST" }],
    }),

    // Override the AI's type guess.
    updateCaptureType: builder.mutation<Capture, { id: string; type: CaptureType }>({
      query: ({ id, type }) => ({
        url: `/captures/${id}`,
        method: "PATCH",
        data: { type },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Capture", id },
        { type: "Capture", id: "LIST" },
      ],
    }),

    // Convert to the real entity (Task/Habit/Note/Resource/Vault).
    convertCapture: builder.mutation<
      { capture: Capture; created: Record<string, unknown> },
      { id: string; data: ConvertCaptureRequest }
    >({
      query: ({ id, data }) => ({
        url: `/captures/${id}/convert`,
        method: "POST",
        data,
      }),
      // Invalidate everything that could be created.
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Capture", id },
        { type: "Capture", id: "LIST" },
        { type: "Task", id: "LIST" },
        { type: "Habit", id: "LIST" },
        { type: "Note", id: "LIST" },
        { type: "Vault", id: "LIST" },
      ],
    }),

    deleteCapture: builder.mutation<void, string>({
      query: (id) => ({ url: `/captures/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Capture", id },
        { type: "Capture", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCaptureQuery,
  useListCapturesQuery,
  useCreateCaptureMutation,
  useUpdateCaptureTypeMutation,
  useConvertCaptureMutation,
  useDeleteCaptureMutation,
} = captureApi;
