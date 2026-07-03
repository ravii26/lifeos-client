import { useEffect, useMemo } from "react";
import { Check, Flame, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { runMutation } from "@/lib/run-mutation";
import { confirm } from "@/components/ui/confirm";
import { localDayKey as dayKey } from "@/lib/date";
import type { Area } from "@/features/areas/types";
import { HabitDots } from "@/components/charts/HabitDots";
import { useVibeConfig } from "@/features/settings/useVibe";

import {
  useDeleteHabitMutation,
  useListHabitLogsQuery,
  useLogHabitMutation,
} from "../habitsApi";
import type { Habit } from "../types";

export function HabitCard({
  habit,
  area,
  onStatus,
  onEdit,
}: {
  habit: Habit;
  area?: Area;
  onStatus?: (id: string, s: { done: boolean; streak: number }) => void;
  onEdit?: (habit: Habit) => void;
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

  const cfg = useVibeConfig();
  const color = area?.color ?? "var(--acc)";
  const measured = habit.habitType === "COUNT" || habit.habitType === "TIMER";
  const unit = habit.habitType === "TIMER" ? "m" : "";
  const step = habit.habitType === "TIMER" ? 5 : 1; // +5m for timers, +1 for counts
  const target =
    habit.habitType === "COUNT"
      ? (habit.targetCount ?? 1)
      : habit.habitType === "TIMER"
        ? (habit.targetMinutes ?? 1)
        : 1;

  // Today's logged amount for measured habits. The log endpoint upserts an
  // absolute value per date, so steppers must send the new running total —
  // read it from todayLog (inline) or fall back to today's entry in logs.
  const todayVal = useMemo(() => {
    if (!measured) return todayDone ? target : 0;
    const fromLog = (l?: { count?: number | null; minutes?: number | null }) =>
      habit.habitType === "COUNT" ? (l?.count ?? 0) : (l?.minutes ?? 0);
    if (habit.todayLog != null) return fromLog(habit.todayLog);
    const today = dayKey(new Date());
    return fromLog((logs ?? []).find((l) => dayKey(new Date(l.date)) === today));
  }, [measured, todayDone, target, habit.habitType, habit.todayLog, logs]);

  const val = todayVal;

  const cadence = habit.frequency.toLowerCase();
  const sub =
    habit.habitType === "BOOLEAN"
      ? `${area?.name ?? "—"} · ${cadence}`
      : `${area?.name ?? "—"} · ${cadence} · target ${target}${unit}`;

  // Upsert today's running total. completed is derived from reaching target so
  // partial progress doesn't falsely count toward the streak.
  const setLog = async (next: number) => {
    if (logging) return;
    const amount = Math.max(0, next);
    const completed = measured ? amount >= target : true;
    const wasDone = todayDone;
    await runMutation(
      logHabit,
      {
        id: habit.id,
        completed,
        ...(habit.habitType === "COUNT" ? { count: amount } : {}),
        ...(habit.habitType === "TIMER" ? { minutes: amount } : {}),
      },
      {
        onSuccess: () => {
          if (completed && !wasDone) {
            const newStreak = streak + 1;
            toast.success(
              newStreak > 1
                ? `${habit.title} logged · ${newStreak} day streak 🔥`
                : `${habit.title} logged`,
            );
          } else if (measured) {
            toast.success(`${habit.title} · ${amount}/${target}${unit}`);
          }
        },
        errorMessage: `Couldn't log ${habit.title}`,
      },
    );
  };

  // Undo today's log (mistaken tap). Upsert completed:false with a zero amount.
  const unlog = async () => {
    if (logging) return;
    await runMutation(
      logHabit,
      {
        id: habit.id,
        completed: false,
        ...(habit.habitType === "COUNT" ? { count: 0 } : {}),
        ...(habit.habitType === "TIMER" ? { minutes: 0 } : {}),
      },
      {
        onSuccess: () => toast(`${habit.title} unmarked`),
        errorMessage: `Couldn't unmark ${habit.title}`,
      },
    );
  };

  const toggleBoolean = () => {
    if (logging) return;
    void (todayDone ? unlog() : setLog(1));
  };

  const handleDelete = async () => {
    if (!(await confirm({
      title: `Delete "${habit.title}"?`,
      confirmText: "Delete",
      danger: true,
    }))) return;
    deleteHabit(habit.id);
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
        {cfg.showStreaks && (
          <span
            className="chip shrink-0"
            style={{
              color: streak > 0 ? "var(--acc)" : "var(--tx-3)",
              borderColor: streak > 0 ? "var(--acc-line)" : "var(--line)",
              ...(cfg.emphasize && streak > 0
                ? { boxShadow: "0 0 10px var(--acc-glow)", fontWeight: 700 }
                : {}),
            }}
          >
            <Flame className={cn("size-[11px]", cfg.emphasize && streak > 0 && "size-3")} /> {streak}
          </span>
        )}
      </div>

      <div className="my-1 mb-3.5">
        <HabitDots history={history} color={color} count={30} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="bar flex-1">
            <i
              style={{
                width: `${Math.min(100, (val / target) * 100)}%`,
                background: color,
              }}
            />
          </div>
          <span className="font-mono text-[11px] text-tx-3">
            {val}/{target}
          </span>
        </div>
        {measured ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLog(val - step)}
              disabled={logging || val <= 0}
              title={`-${step}${unit}`}
              className="grid size-7 shrink-0 place-items-center rounded-md text-tx-3 transition hover:bg-surface-3 hover:text-tx disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLog(val + step)}
              disabled={logging}
              title={`+${step}${unit}`}
              className={cn("ds-btn sm", !todayDone && "acc")}
            >
              {todayDone ? (
                <>
                  <Check className="size-3" /> Done
                </>
              ) : (
                <>
                  <Plus className="size-3" /> +{step}
                  {unit}
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleBoolean}
            disabled={logging}
            title={todayDone ? "Tap to unmark" : "Mark done for today"}
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
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(habit)}
            title="Edit habit"
            className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 opacity-0 transition hover:bg-surface-3 hover:text-tx group-hover:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
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
