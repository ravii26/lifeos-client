import { api } from "@/store/api";
import type { EntityLink, EntityType, LinkRole, CreateLinkRequest } from "./types";

export const linksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Every link touching a given entity, in either direction.
    listLinks: builder.query<
      EntityLink[],
      { type: EntityType; id: string; role?: LinkRole }
    >({
      query: (params) => ({ url: "/links", method: "GET", params }),
      // A single LIST tag: any create/delete refetches every mounted link list.
      // Only a couple are ever mounted at once, so this stays cheap and simple.
      providesTags: [{ type: "Link", id: "LIST" }],
    }),

    createLink: builder.mutation<EntityLink, CreateLinkRequest>({
      query: (body) => ({ url: "/links", method: "POST", data: body }),
      invalidatesTags: [{ type: "Link", id: "LIST" }],
    }),

    deleteLink: builder.mutation<void, string>({
      query: (id) => ({ url: `/links/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Link", id: "LIST" }],
    }),
  }),
});

export const { useListLinksQuery, useCreateLinkMutation, useDeleteLinkMutation } =
  linksApi;
