import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "./authSlice";

/**
 * Gate for authenticated routes. If there's no token in the auth slice,
 * redirect to /login; otherwise render the nested route via <Outlet />.
 * `replace` avoids stacking the protected URL in the browser history.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
