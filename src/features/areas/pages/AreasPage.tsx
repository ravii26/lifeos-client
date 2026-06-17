import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Donut } from "@/components/charts/Donut";
import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";
import { useListTasksQuery } from "@/features/tasks/tasksApi";
import { useListHabitsQuery } from "@/features/habits/habitsApi";
import { useListGoalsQuery } from "@/features/goals/goalsApi";

import { useListAreasQuery, useSnapshotAreaScoreMutation } from "../areasApi";
import { AreaCard, type AreaStats } from "../components/AreaCard";
import { NewAreaForm } from "../components/NewAreaForm";

export function AreasPage() {
  const { data: areas, isLoading, isError } = useListAreasQuery();
  const { data: tasks } = useListTasksQuery();
  const { data: habits } = useListHabitsQuery();
  const { data: goals } = useListGoalsQuery();
  const [showForm, setShowForm] = useState(false);
  const [snapshotAreaScore] = useSnapshotAreaScoreMutation();
  useLogBehaviorOnMount("AREA_VIEWED");

  // A3: persist a score snapshot once per page visit for each scored area.
  useEffect(() => {
    if (!areas) return;
    for (const a of areas) {
      if (a.score != null) snapshotAreaScore(a.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas?.map((a) => a.id).join(",")]);

  const statsByArea = useMemo(() => {
    const m = new Map<string, AreaStats>();
    for (const a of areas ?? []) {
      // A2: prefer server-computed score/tasksDone/tasksTotal when present.
      const serverScore = a.score != null;
      const mine = (tasks ?? []).filter((t) => t.areaId === a.id);
      const done = serverScore ? (a.tasksDone ?? 0) : mine.filter((t) => t.status === "COMPLETED").length;
      const total = serverScore ? (a.tasksTotal ?? mine.length) : mine.length;
      m.set(a.id, {
        score: serverScore ? (a.score ?? 0) : (total ? Math.round((done / total) * 100) : 0),
        tasksDone: done,
        tasksTotal: total,
        habits: (habits ?? []).filter((h) => h.areaId === a.id).length,
        goals: (goals ?? []).filter((g) => g.areaId === a.id).length,
        streak: a.streak ?? undefined,
        focusMins: a.focusMins ?? undefined,
      });
    }
    return m;
  }, [areas, tasks, habits, goals]);

  const scored = (areas ?? []).map((a) => ({
    area: a,
    score: statsByArea.get(a.id)?.score ?? 0,
  }));
  const avg = scored.length
    ? Math.round(scored.reduce((s, x) => s + x.score, 0) / scored.length)
    : 0;
  const strongest = [...scored].sort((a, b) => b.score - a.score)[0];
  const weakest = [...scored].sort((a, b) => a.score - b.score)[0];
  const balance =
    avg >= 65 ? "well balanced" : avg >= 50 ? "finding balance" : "out of balance";

  return (
    <div className="page rise">
      <div className="page-head">
        <div className="eyebrow">Insights · balance</div>
        <h1 className="page-title">Life Areas</h1>
        <div className="page-sub">
          The domains everything else hangs off. Scores reflect task completion.
        </div>
      </div>

      <div className="mb-[var(--gap)] flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ds-btn ghost"
        >
          <Plus className="size-3.5" /> New area
        </button>
      </div>

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewAreaForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading areas…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your areas. Is the backend running?
        </p>
      )}

      {areas && areas.length > 0 && (
        <>
          {/* Average summary */}
          <div className="card raised card-pad mb-[var(--gap)] flex items-center gap-[22px]">
            <Donut value={avg} size={92} stroke={9} color="var(--acc)">
              <span className="font-mono text-[26px] font-semibold">{avg}</span>
            </Donut>
            <div>
              <div className="eyebrow mb-1">Average across all areas</div>
              <div className="h-display mb-0.5 text-[20px]">
                You're {balance}
              </div>
              {strongest && weakest && (
                <div className="text-[13px] text-tx-3">
                  Strongest:{" "}
                  <span style={{ color: strongest.area.color }}>
                    {strongest.area.name}
                  </span>{" "}
                  · Needs love:{" "}
                  <span style={{ color: weakest.area.color }}>
                    {weakest.area.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-[var(--gap)] sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                stats={statsByArea.get(area.id)!}
              />
            ))}
          </div>
        </>
      )}

      {areas && areas.length === 0 && !showForm && (
        <div className="card card-pad empty mt-[var(--gap)]">
          No areas yet — create your first life domain.
        </div>
      )}
    </div>
  );
}
