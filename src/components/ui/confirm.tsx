import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export type ConfirmOptions = {
  /** Heading shown at the top of the dialog. */
  title: string;
  /** Optional supporting line under the title. */
  description?: string;
  /** Label for the confirming action. Defaults to "Confirm". */
  confirmText?: string;
  /** Label for the dismissing action. Defaults to "Cancel". */
  cancelText?: string;
  /** Style the confirm button as a destructive action. */
  danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

// Module-level bridge so any module can call confirm() without prop drilling.
let push: ((p: Pending) => void) | null = null;

/**
 * Promise-based replacement for the native window.confirm().
 * Usage:  if (!(await confirm({ title: "Delete this?", danger: true })) return;
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) {
      // Host not mounted — fail safe by cancelling.
      resolve(false);
      return;
    }
    push({ ...options, resolve });
  });
}

/** Mount once near the app root (alongside <Toaster />). */
export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    push = (p) => setPending(p);
    return () => {
      push = null;
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function close(ok: boolean) {
    pending?.resolve(ok);
    setPending(null);
  }

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh]">
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => close(false)}
        className="absolute inset-0 bg-black/55"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={pending.title}
        className="rise relative w-full max-w-sm overflow-hidden rounded-xl border border-line-2 bg-surface-1 p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          {pending.danger && (
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/12 text-danger">
              <AlertTriangle className="size-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-[680] leading-tight tracking-tight text-tx">
              {pending.title}
            </h2>
            {pending.description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-tx-2">
                {pending.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="ds-btn ghost"
          >
            {pending.cancelText ?? "Cancel"}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className={
              pending.danger
                ? "ds-btn bg-danger text-white hover:opacity-90"
                : "ds-btn acc"
            }
          >
            {pending.confirmText ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
