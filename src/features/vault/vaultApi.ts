import { api } from "@/store/api";
import type {
  CreateVaultRequest,
  UpdateVaultRequest,
  VaultItem,
  VaultType,
} from "./types";

export const vaultApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listVault: builder.query<
      VaultItem[],
      { vaultType?: VaultType; triggerTag?: string } | void
    >({
      query: (filters) => ({
        url: "/vault",
        method: "GET",
        ...(filters && Object.values(filters).some((v) => v)
          ? { params: filters }
          : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((v) => ({ type: "Vault" as const, id: v.id })),
              { type: "Vault" as const, id: "LIST" },
            ]
          : [{ type: "Vault" as const, id: "LIST" }],
    }),

    createVault: builder.mutation<VaultItem, CreateVaultRequest>({
      query: (body) => ({ url: "/vault", method: "POST", data: body }),
      invalidatesTags: [{ type: "Vault", id: "LIST" }],
    }),

    updateVault: builder.mutation<
      VaultItem,
      { id: string; data: UpdateVaultRequest }
    >({
      query: ({ id, data }) => ({ url: `/vault/${id}`, method: "PATCH", data }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Vault", id },
        { type: "Vault", id: "LIST" },
      ],
    }),

    deleteVault: builder.mutation<void, string>({
      query: (id) => ({ url: `/vault/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Vault", id },
        { type: "Vault", id: "LIST" },
      ],
    }),

    // B7 — increments usedCount, fires VAULT_ACCESSED server-side.
    markVaultUsed: builder.mutation<VaultItem, string>({
      query: (id) => ({ url: `/vault/${id}/used`, method: "POST" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Vault", id },
        { type: "Vault", id: "LIST" },
      ],
    }),

    // Increments helpfulCount — feeds the coach's "resurface what helps" ranking.
    markVaultHelpful: builder.mutation<VaultItem, string>({
      query: (id) => ({ url: `/vault/${id}/helpful`, method: "POST" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Vault", id },
        { type: "Vault", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListVaultQuery,
  useCreateVaultMutation,
  useUpdateVaultMutation,
  useDeleteVaultMutation,
  useMarkVaultUsedMutation,
  useMarkVaultHelpfulMutation,
} = vaultApi;
