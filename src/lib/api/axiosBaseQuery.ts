import axios, {
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { env } from "@/lib/env";

/* ------------------------------------------------------------------ *
 * Token storage — the JWT lives in localStorage so the session
 * survives refreshes. This is the single source for reading/writing it.
 * ------------------------------------------------------------------ */
const TOKEN_KEY = "lifeos.token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/* ------------------------------------------------------------------ *
 * The one Axios instance every request goes through.
 * ------------------------------------------------------------------ */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
});

// Request interceptor: attach the JWT to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ *
 * The shape of an error after we normalise the backend's envelope.
 * ------------------------------------------------------------------ */
export type ApiError = {
  status?: number;
  message: string;
  /** Field-level validation details from the backend, if any. */
  errors?: Record<string, string[]> | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
};

/**
 * Adapts Axios into an RTK Query "base query".
 * - On success: unwraps the `{ success, message, data }` envelope and
 *   returns just `data`, so endpoints deal with plain payloads.
 * - On failure: normalises the error into our ApiError shape, and clears
 *   the token on 401 (full logout is wired with the auth feature).
 */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await apiClient({ url, method, data, params });
      const envelope = result.data as ApiEnvelope<unknown>;
      return { data: envelope.data };
    } catch (e) {
      const error = e as AxiosError<{
        message?: string;
        errors?: Record<string, string[]> | null;
      }>;

      if (error.response?.status === 401) {
        tokenStorage.clear();
      }

      return {
        error: {
          status: error.response?.status,
          message: error.response?.data?.message ?? error.message,
          errors: error.response?.data?.errors ?? null,
        },
      };
    }
  };
