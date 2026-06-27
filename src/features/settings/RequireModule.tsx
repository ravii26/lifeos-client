import { Navigate, Outlet } from "react-router-dom";

import { useEnabledModules } from "./useEnabledModules";

/**
 * Route guard: renders the nested routes only if `module` is enabled, otherwise
 * redirects home. Stops a disabled module from being reached by its URL even
 * though it's hidden from the sidebar. While settings load, `isEnabled` reports
 * true, so we never bounce the user off a valid page on first paint.
 */
export function RequireModule({ module }: { module: string }) {
  const { isEnabled } = useEnabledModules();
  return isEnabled(module) ? <Outlet /> : <Navigate to="/" replace />;
}
