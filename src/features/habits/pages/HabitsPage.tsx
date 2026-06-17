import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Stat } from "@/components/ui/Stat";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListHabitsQuery } from "../habitsApi";
import { HabitCard } from "../components/HabitCard";
import { NewHabitForm } from "../components/NewHabitForm";

type Filter = "active" | "paused" | "all";
type Status = { done: boolean; streak: number };

export function HabitsPage() {
  const { data: habits, isLoading, isError } = useListHabitsQuery();
  const { data: areas } = useListAreasQuery();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("active");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const onStatus = useCallback((id: string, s: Status) => {
    setStatuses((prev) =>
      prev[id]?.done === s.done && prev[id]?.streak === s.streak
        ? prev
        : { ...prev, [id]: s },
    );
  }, []);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const all = useMemo(() => habits ?? [], [habits]);
  const active = useMemo(() => all.filter((h) => h.isActive), [all]);

  const list = useMemo(() => {
    if (filter === "active") return active;
    if (filter === "paused") return all.filter((h) => !h.isActive);
    return all;
  }, [filter, all, active]);

  // B4: prefer server-inline stats; fall back to card-reported once cards load.
  const hasInlineStats = active.some((h) => h.todayDone != null);
  const serverDoneToday = active.filter((h) => h.todayDone).length;
  const serverBestStreak = active.reduce(
    (max, h) => Math.max(max, h.currentStreak ?? 0),
    0,
  );
  const reported = active.map((h) => statuses[h.id]).filter(Boolean) as Status[];
  const doneToday = hasInlineStats ? serverDoneToday : reported.filter((s) => s.done).length;
  const bestStreak = hasInlineStats
    ? serverBestStreak
    : reported.length
      ? Math.max(...reported.map((s) => s.streak))
      : 0;
  const completion = active.length
    ? Math.round((doneToday / active.length) * 100)
    : 0;

  const stats = [
    { num: `${doneToday}/${active.length}`, label: "Complete today" },
    { num: `${bestStreak}d`, label: "Longest streak", color: "var(--acc)" },
    { num: `${completion}%`, label: "Completion rate" },
    { num: active.length, label: "Active habits" },
  ];

  return (
    <div className="page rise">
      <div className="mb-[var(--gap)] flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Execution</div>
          <h1 className="page-title">Habits</h1>
          <div className="page-sub">
            {active.length} active · {bestStreak}-day best streak
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ds-btn ghost"
        >
          <Plus className="size-3.5" /> New habit
        </button>
      </div>

      <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
        {stats.map((x) => (
          <div key={x.label} className="card card-pad">
            <Stat num={x.num} label={x.label} color={x.color} />
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewHabitForm areas={areas ?? []} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="seg mb-[var(--gap)]">
        {(["active", "paused", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            className={cn(filter === f && "on")}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-tx-3">Loading habits…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your habits. Is the backend running?
        </p>
      )}

      <div className="grid gap-[var(--gap)] lg:grid-cols-2">
        {list.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            area={habit.areaId ? areaById.get(habit.areaId) : undefined}
            onStatus={onStatus}
          />
        ))}
      </div>

      {!isLoading && list.length === 0 && (
        <div className="card card-pad empty mt-[var(--gap)]">
          {all.length === 0
            ? "No habits yet — build your first routine."
            : "No habits in this filter."}
        </div>
      )}
    </div>
  );
}
