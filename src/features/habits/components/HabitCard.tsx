import { useMemo } from "react";
import { Check, Clock, Flame, Repeat, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";

import {
  useDeleteHabitMutation,
  useListHabitLogsQuery,
  useLogHabitMutation,
} from "../habitsApi";
import type { Habit } from "../types";

/** Local YYYY-MM-DD key (logs are matched by calendar day, not timestamp). */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function HabitCard({ habit, area }: { habit: Habit; area?: Area }) {
  const { data: logs } = useListHabitLogsQuery(habit.id);
  const [logHabit, { isLoading: logging }] = useLogHabitMutation();
  const [deleteHabit, { isLoading: deleting }] = useDeleteHabitMutation();

  // Set of calendar days with a completed log entry.
  const loggedDays = useMemo(
    () =>
      new Set(
        (logs ?? [])
          .filter((l) => l.completed !== false)
          .map((l) => dayKey(new Date(l.date))),
      ),
    [logs],
  );

  // Last 7 days, oldest → today.
  const week = useMemo(() => {
    const out: { key: string; label: string; done: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      out.push({
        key,
        label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        done: loggedDays.has(key),
      });
    }
    return out;
  }, [loggedDays]);

  const todayDone = loggedDays.has(dayKey(new Date()));

  // Prefer the server's streak; otherwise count consecutive days back to today.
  const streak = useMemo(() => {
    if (habit.currentStreak != null) return habit.currentStreak;
    let n = 0;
    const d = new Date();
    if (!loggedDays.has(dayKey(d))) return 0;
    while (loggedDays.has(dayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [habit.currentStreak, loggedDays]);

  const handleLog = () => {
    if (todayDone || logging) return;
    // Idempotent upsert; send the target as count/minutes for COUNT/TIMER.
    logHabit({
      id: habit.id,
      completed: true,
      ...(habit.habitType === "COUNT" && habit.targetCount != null
        ? { count: habit.targetCount }
        : {}),
      ...(habit.habitType === "TIMER" && habit.targetMinutes != null
        ? { minutes: habit.targetMinutes }
        : {}),
    });
  };

  const target =
    habit.habitType === "COUNT" && habit.targetCount != null
      ? `${habit.targetCount}×`
      : habit.habitType === "TIMER" && habit.targetMinutes != null
        ? `${habit.targetMinutes}m`
        : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface-1 p-4",
        !habit.isActive && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{habit.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-tx-3">
            {area && (
              <span className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </span>
            )}
            <span className="flex items-center gap-1 font-mono text-[10.5px]">
              <Repeat className="size-3" />
              {habit.frequency.toLowerCase()}
            </span>
            {target && (
              <span className="font-mono text-[10.5px]">{target}</span>
            )}
            {habit.reminderTime && (
              <span className="flex items-center gap-1 font-mono text-[10.5px]">
                <Clock className="size-3" />
                {habit.reminderTime}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => deleteHabit(habit.id)}
          disabled={deleting}
          title="Delete habit"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* 7-day history strip */}
      <div className="mt-4 flex items-center gap-1.5">
        {week.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-6 w-full rounded-md border",
                d.done
                  ? "border-primary bg-primary/80"
                  : "border-line-2 bg-surface-2",
              )}
            />
            <span className="text-[9px] text-tx-4">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-tx-3">
          <Flame
            className={cn("size-3.5", streak > 0 ? "text-warn" : "text-tx-4")}
          />
          {streak > 0 ? `${streak}-day streak` : "No streak yet"}
        </span>

        <button
          type="button"
          onClick={handleLog}
          disabled={todayDone || logging}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            todayDone
              ? "bg-surface-2 text-tx-3"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
          {todayDone ? "Done today" : logging ? "Logging…" : "Log today"}
        </button>
      </div>
    </div>
  );
}
