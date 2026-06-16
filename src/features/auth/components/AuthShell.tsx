import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared centered layout for the login & register screens. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4 text-tx">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground">
            L
          </div>
          <span className="text-lg font-semibold tracking-tight">LifeOS</span>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-7">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-tx-3">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-5 text-center text-sm text-tx-3">{footer}</p>
        )}
      </div>
    </div>
  );
}
