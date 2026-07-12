import { useMemo } from "react";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { runMutation } from "@/lib/run-mutation";
import { localDayKey } from "@/lib/date";
import type { Area } from "@/features/areas/types";
import {
  useListHabitLogsQuery,
  useLogHabitMutation,
} from "@/features/habits/habitsApi";
import type { Habit } from "@/features/habits/types";

function todayKey(): string {
  return localDayKey(new Date());
}

/** Compact dashboard habit row: area dot, title, progress bar, log check. */
export function QuickHabitRow({ habit, area }: { habit: Habit; area?: Area }) {
  const { data: logs } = useListHabitLogsQuery(habit.id);
  const [logHabit, { isLoading }] = useLogHabitMutation();

  const done = useMemo(() => {
    const tk = todayKey();
    return (logs ?? []).some(
      (l) =>
        l.completed !== false &&
        new Date(l.date).toISOString().slice(0, 10) === tk,
    );
  }, [logs]);

  const target =
    habit.habitType === "COUNT"
      ? (habit.targetCount ?? 1)
      : habit.habitType === "TIMER"
        ? (habit.targetMinutes ?? 1)
        : 1;
  const val = done ? target : 0;
  const color = area?.color ?? "var(--acc)";

  const log = () => {
    if (done || isLoading) return;
    runMutation(
      logHabit,
      {
        id: habit.id,
        completed: true,
        ...(habit.habitType === "COUNT" && habit.targetCount != null
          ? { count: habit.targetCount }
          : {}),
        ...(habit.habitType === "TIMER" && habit.targetMinutes != null
          ? { minutes: habit.targetMinutes }
          : {}),
      },
      { errorMessage: `Couldn't log ${habit.title}` },
    );
  };

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-[13px] font-medium">{habit.title}</span>
          <span className="text-[11.5px] text-tx-3">
            {val}/{target}
          </span>
        </div>
        <div className="bar mt-1.5">
          <i style={{ width: `${(val / target) * 100}%`, background: color }} />
        </div>
      </div>
      <button
        type="button"
        onClick={log}
        disabled={isLoading}
        className={cn("check size-[26px]", done && "on")}
        title={done ? "Logged today" : "Log today"}
      >
        {done ? <Check className="size-3.5" strokeWidth={2.6} /> : <Plus className="size-3.5" />}
      </button>
    </div>
  );
}
