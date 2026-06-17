import { useEffect, useMemo } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";
import { HabitDots } from "@/components/charts/HabitDots";

import {
  useDeleteHabitMutation,
  useListHabitLogsQuery,
  useLogHabitMutation,
} from "../habitsApi";
import type { Habit } from "../types";

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function HabitCard({
  habit,
  area,
  onStatus,
}: {
  habit: Habit;
  area?: Area;
  onStatus?: (id: string, s: { done: boolean; streak: number }) => void;
}) {
  // B4: use server-inlined history/stats when present; fall back to logs query.
  const hasInline = habit.history != null;
  const { data: logs } = useListHabitLogsQuery(habit.id, { skip: hasInline });
  const [logHabit, { isLoading: logging }] = useLogHabitMutation();
  const [deleteHabit, { isLoading: deleting }] = useDeleteHabitMutation();

  const loggedDays = useMemo(
    () =>
      new Set(
        (logs ?? [])
          .filter((l) => l.completed !== false)
          .map((l) => dayKey(new Date(l.date))),
      ),
    [logs],
  );

  // Prefer inline 28-day history array; build from logs if not present.
  const history = useMemo(() => {
    if (habit.history != null) return habit.history;
    const out: boolean[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(loggedDays.has(dayKey(d)));
    }
    return out;
  }, [habit.history, loggedDays]);

  const todayDone =
    habit.todayDone != null
      ? habit.todayDone
      : loggedDays.has(dayKey(new Date()));

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

  // Report today-status up so the page can aggregate stats.
  useEffect(() => {
    onStatus?.(habit.id, { done: todayDone, streak });
  }, [habit.id, todayDone, streak, onStatus]);

  const color = area?.color ?? "var(--acc)";
  const target =
    habit.habitType === "COUNT"
      ? (habit.targetCount ?? 1)
      : habit.habitType === "TIMER"
        ? (habit.targetMinutes ?? 1)
        : 1;
  const val = todayDone ? target : 0;

  const cadence = habit.frequency.toLowerCase();
  const sub =
    habit.habitType === "BOOLEAN"
      ? `${area?.name ?? "—"} · ${cadence}`
      : `${area?.name ?? "—"} · ${cadence} · target ${target}${habit.habitType === "TIMER" ? "m" : ""}`;

  const log = async () => {
    if (todayDone || logging) return;
    await logHabit({
      id: habit.id,
      completed: true,
      ...(habit.habitType === "COUNT" && habit.targetCount != null
        ? { count: habit.targetCount }
        : {}),
      ...(habit.habitType === "TIMER" && habit.targetMinutes != null
        ? { minutes: habit.targetMinutes }
        : {}),
    });
    const newStreak = streak + 1;
    toast.success(
      newStreak > 1
        ? `${habit.title} logged · ${newStreak} day streak 🔥`
        : `${habit.title} logged`,
    );
  };

  return (
    <div className={cn("card card-pad group", !habit.isActive && "opacity-60")}>
      <div className="mb-3 flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="mt-1 size-[9px] shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{habit.title}</div>
            <div className="mt-0.5 font-mono text-[11px] text-tx-3">{sub}</div>
          </div>
        </div>
        <span
          className="chip shrink-0"
          style={{
            color: streak > 0 ? "var(--acc)" : "var(--tx-3)",
            borderColor: streak > 0 ? "var(--acc-line)" : "var(--line)",
          }}
        >
          <Flame className="size-[11px]" /> {streak}
        </span>
      </div>

      <div className="my-1 mb-3.5">
        <HabitDots history={history} color={color} count={30} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="bar flex-1">
            <i
              style={{ width: `${(val / target) * 100}%`, background: color }}
            />
          </div>
          <span className="font-mono text-[11px] text-tx-3">
            {val}/{target}
          </span>
        </div>
        <button
          type="button"
          onClick={log}
          disabled={logging}
          className={cn("ds-btn sm", !todayDone && "acc")}
        >
          {todayDone ? (
            <>
              <Check className="size-3" /> Logged
            </>
          ) : (
            <>
              <Plus className="size-3" /> Log today
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => deleteHabit(habit.id)}
          disabled={deleting}
          title="Delete habit"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 opacity-0 transition hover:bg-surface-3 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
