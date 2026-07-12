import { Link } from "react-router-dom";
import { Focus, Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveFocus } from "@/features/focus/useActiveFocus";

/** The big focus-timer hero card on the dashboard. */
export function FocusCard() {
  const { active, label, start, stop, starting, stopping } = useActiveFocus();

  return (
    <div
      className="card raised card-pad relative flex flex-col overflow-hidden"
      style={active ? { borderTop: "5px solid var(--acc)" } : undefined}
    >
      <div className="relative flex items-center justify-between">
        <div className="eyebrow">Focus work</div>
        {active && (
          <span className="chip dot border-acc-line text-acc">Live</span>
        )}
      </div>

      <div
        className={cn(
          "relative my-1.5 mt-3.5 font-display text-[56px] font-[560] leading-none [font-variant-numeric:tabular-nums]",
          active ? "text-acc" : "text-tx",
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
            <Pause className="size-3.5" /> Stop &amp; log
          </button>
        ) : (
          <button
            type="button"
            onClick={() => start()}
            disabled={starting}
            className="ds-btn acc"
          >
            {active ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {starting ? "Starting…" : "Start focus"}
          </button>
        )}
        <Link to="/focus" className="ds-btn ghost">
          <Focus className="size-3.5" /> Immersive
        </Link>
      </div>
    </div>
  );
}
