import { api } from "@/store/api";
import type { Identity, UpdateIdentityRequest } from "./types";

export const identityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Can return null when the user hasn't set up an identity yet.
    getIdentity: builder.query<Identity | null, void>({
      query: () => ({ url: "/identity", method: "GET" }),
      providesTags: [{ type: "Identity", id: "ME" }],
    }),

    // PUT upserts the whole record.
    updateIdentity: builder.mutation<Identity, UpdateIdentityRequest>({
      query: (body) => ({ url: "/identity", method: "PUT", data: body }),
      invalidatesTags: [{ type: "Identity", id: "ME" }],
    }),
  }),
});

export const { useGetIdentityQuery, useUpdateIdentityMutation } = identityApi;
