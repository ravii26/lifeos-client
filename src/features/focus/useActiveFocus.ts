import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useListFocusQuery,
  useStartFocusMutation,
  useStopFocusMutation,
} from "./focusApi";
import type { FocusSession } from "./types";

/** mm:ss (or h:mm:ss past an hour) from a millisecond duration. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Single source of truth for the live focus session. The active session is
 * derived from the server list (one with no end), so it's correct after a
 * refresh or across components. Local `now` ticks only while running.
 */
export function useActiveFocus() {
  const { data: sessions } = useListFocusQuery();
  const [startFocus, { isLoading: starting }] = useStartFocusMutation();
  const [stopFocus, { isLoading: stopping }] = useStopFocusMutation();
  const [now, setNow] = useState(() => Date.now());

  const active: FocusSession | undefined = (sessions ?? []).find(
    (s) => !s.endedAt && s.durationMinutes == null,
  );

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const elapsedMs = active ? now - new Date(active.startedAt).getTime() : 0;

  return {
    active,
    elapsedMs,
    label: formatElapsed(elapsedMs),
    start: async (taskId?: string) => {
      if (starting) return;
      await startFocus(taskId ? { taskId } : undefined);
      toast("Focus session started", { icon: "⚡" });
    },
    stop: async () => {
      if (!active || stopping) return;
      const elapsed = formatElapsed(Date.now() - new Date(active.startedAt).getTime());
      await stopFocus(active.id);
      toast(`Session logged · ${elapsed}`, { icon: "⏸" });
    },
    starting,
    stopping,
  };
}
