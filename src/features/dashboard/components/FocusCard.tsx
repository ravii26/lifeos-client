import { Pause, Play, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveFocus } from "@/features/focus/useActiveFocus";

/** The big focus-timer hero card on the dashboard. */
export function FocusCard() {
  const { active, label, start, stop, starting, stopping } = useActiveFocus();

  return (
    <div className="card raised card-pad relative flex flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: active
            ? "radial-gradient(90% 80% at 100% 0%, var(--acc-soft), transparent 60%)"
            : "none",
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="eyebrow">Focus work</div>
        {active && (
          <span className="chip dot border-acc-line text-primary">Live</span>
        )}
      </div>

      <div
        className={cn(
          "relative my-1.5 mt-3.5 font-mono text-[56px] font-semibold leading-none tracking-[-0.03em]",
          active ? "text-primary" : "text-tx",
        )}
      >
        {label}
      </div>
      <div className="relative min-h-[18px] text-sm text-tx-3">
        {active ? "Session in progress" : "No active session"}
      </div>

      <div className="relative mt-auto flex gap-2 pt-[18px]">
        {active ? (
          <button
            type="button"
            onClick={stop}
            disabled={stopping}
            className="ds-btn"
          >
            <Pause className="size-3.5" /> Pause &amp; log
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={starting}
            className="ds-btn acc"
          >
            {active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {starting ? "Starting…" : "Start focus"}
          </button>
        )}
        <button type="button" onClick={start} className="ds-btn ghost">
          <Zap className="size-3.5" /> Quick start
        </button>
      </div>
    </div>
  );
}
