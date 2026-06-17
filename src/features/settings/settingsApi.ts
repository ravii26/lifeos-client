import { api } from "@/store/api";
import type { UpdateSettingsRequest, UserSettings } from "./types";

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<UserSettings, void>({
      query: () => ({ url: "/settings", method: "GET" }),
      providesTags: [{ type: "Settings", id: "SINGLETON" }],
    }),

    updateSettings: builder.mutation<UserSettings, UpdateSettingsRequest>({
      query: (data) => ({ url: "/settings", method: "PATCH", data }),
      invalidatesTags: [{ type: "Settings", id: "SINGLETON" }],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
