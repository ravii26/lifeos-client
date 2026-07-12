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
        <div className="mb-6">
          <span className="font-display text-[26px] font-[850] tracking-tight">
            LifeOS<span className="text-acc">.</span>
          </span>
        </div>

        <div className="border-2 border-tx bg-surface-1 p-7 shadow-[var(--shadow-2)]">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
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
