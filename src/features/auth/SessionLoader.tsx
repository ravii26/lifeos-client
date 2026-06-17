import { useEffect, type ReactNode } from "react";

import { FullScreenLoader } from "@/components/FullScreenLoader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useApplySettings } from "@/features/settings/useApplySettings";

import { useMeQuery } from "./authApi";
import { logout, selectToken, setUser } from "./authSlice";

/**
 * Restores the session on app load.
 * - With a token but no user yet, fetch `me` and store the user.
 * - On error (e.g. expired token → 401), log out.
 * - Shows a splash only during the first fetch, so we don't flash UI.
 */
export function SessionLoader({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  useApplySettings();

  // `skip` means: don't even call `me` when there's no token to validate.
  const { data, isError, isLoading } = useMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) dispatch(logout());
  }, [isError, dispatch]);

  if (token && isLoading) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
