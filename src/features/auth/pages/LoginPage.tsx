import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { applyApiErrors } from "@/lib/api/formErrors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { AuthShell } from "../components/AuthShell";
import { useLoginMutation } from "../authApi";
import { selectIsAuthenticated, setCredentials } from "../authSlice";
import { loginSchema, type LoginValues } from "../schema";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      // .unwrap() returns the payload on success, or throws the ApiError.
      const result = await login(values).unwrap();
      dispatch(setCredentials(result));
      navigate("/", { replace: true });
    } catch (err) {
      applyApiErrors(err as ApiError, setError);
    }
  };

  // Already logged in? Skip the form.
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back to LifeOS."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-danger">{errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
