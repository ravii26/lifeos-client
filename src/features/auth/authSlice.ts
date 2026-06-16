import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import { tokenStorage } from "@/lib/api/axiosBaseQuery";
import type { AuthResponse, User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
}

/**
 * Token is seeded from localStorage so a page refresh keeps you logged in.
 * The `user` starts null and is restored on app load via the `me` query.
 */
const initialState: AuthState = {
  user: null,
  token: tokenStorage.get(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after a successful login/register.
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      tokenStorage.set(action.payload.token);
    },
    // Called after restoring the session from `me`.
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      tokenStorage.clear();
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

/* Selectors — the single way components read auth state. */
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.token);
