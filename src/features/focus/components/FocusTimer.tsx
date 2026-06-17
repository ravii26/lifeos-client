import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveFocus } from "../useActiveFocus";

export function FocusTimer() {
  const { active, label, start, stop, starting, stopping } = useActiveFocus();

  if (active) {
    return (
      <button
        type="button"
        onClick={stop}
        disabled={stopping}
        title="Stop focus session"
        className={cn(
          "flex items-center gap-2 rounded-full border border-acc-line bg-acc-soft px-3 py-1.5",
          "text-xs font-medium text-primary transition-colors hover:brightness-110 disabled:opacity-60",
        )}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <span className="font-mono tabular-nums">{label}</span>
        <Pause className="size-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => start()}
      disabled={starting}
      title="Start a focus session"
      className="flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium text-tx-2 transition-colors hover:border-acc-line hover:text-tx disabled:opacity-60"
    >
      <Play className="size-3.5" />
      {starting ? "Starting…" : "Focus"}
    </button>
  );
}
