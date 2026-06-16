import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/store/api";
import authReducer from "@/features/auth/authSlice";

/**
 * The Redux store.
 * - `api.reducer` holds all RTK Query cached server data.
 * - `api.middleware` powers caching, invalidation, polling, etc.
 * - feature slices (e.g. auth) hold client state.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviour for RTK Query.
setupListeners(store.dispatch);

// Types inferred from the store itself — the source of truth for our hooks.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
