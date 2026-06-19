import { useEffect } from "react";

import type { Goal } from "../types";

/**
 * Shown when activating a goal would exceed the focus cap. The user picks one
 * of the currently-active goals to park, freeing a slot for `activatingTitle`.
 */
export function ParkChooser({
  activeGoals,
  activatingTitle,
  maxActive,
  busy,
  onChoose,
  onCancel,
}: {
  activeGoals: Goal[];
  activatingTitle: string;
  maxActive: number;
  busy?: boolean;
  onChoose: (parkGoalId: string) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[16vh]">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a goal to park"
        className="rise relative w-full max-w-md overflow-hidden rounded-xl border border-line-2 bg-surface-1 p-6 shadow-2xl"
      >
        <h2 className="text-[15px] font-[680] leading-tight tracking-tight text-tx">
          You can focus on {maxActive} goals
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-tx-2">
          Park one to make room for{" "}
          <span className="font-medium text-tx">“{activatingTitle}”</span>.
        </p>

        <div className="mt-4 space-y-2">
          {activeGoals.map((g) => (
            <button
              key={g.id}
              type="button"
              disabled={busy}
              onClick={() => onChoose(g.id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-line-2 bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-line hover:bg-surface-3 disabled:opacity-60"
            >
              <span className="min-w-0 truncate text-sm font-medium text-tx">
                {g.title}
              </span>
              <span className="shrink-0 text-xs text-primary">Park this</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="ds-btn ghost"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
