import { api } from "@/store/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "./types";

/**
 * Auth endpoints, injected into the single base API.
 * `injectEndpoints` keeps this feature's calls co-located here while still
 * sharing one cache/middleware with the rest of the app.
 *
 * The first generic is the RESULT type (already unwrapped from the
 * { success, message, data } envelope by our axiosBaseQuery); the second
 * is the ARGUMENT the hook is called with.
 */
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", data: body }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", data: body }),
    }),
    me: builder.query<User, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["Auth"],
    }),
  }),
});

// Auto-generated hooks — one per endpoint.
export const { useRegisterMutation, useLoginMutation, useMeQuery } = authApi;
