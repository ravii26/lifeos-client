import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useListProjectsQuery } from "@/features/goals/goalsApi";
import { useListTasksQuery } from "@/features/tasks/tasksApi";
import { useListAreasQuery } from "@/features/areas/areasApi";

// Mirrors the backend's own "stalled project" heuristic (decisions.ai.ts) so
// this card shows the same signal the AI recommender already reasons about —
// previously the only place that view existed was inside the AI's own head.
function computeStalled(openTasks: number, daysSinceProgress: number | null, hasOverdue: boolean) {
  return openTasks > 0 && (hasOverdue || daysSinceProgress === null || daysSinceProgress >= 7);
}

/** Cross-goal "what's actually moving" view — active projects, flagging stalls. */
export function ActiveProjectsCard() {
  const { data: projects, isLoading, isError } = useListProjectsQuery({ status: "ACTIVE" });
  const { data: tasks } = useListTasksQuery();
  const { data: areas } = useListAreasQuery();

  const areaById = useMemo(
    () => new Map((areas ?? []).map((a) => [a.id, a])),
    [areas],
  );

  const rows = useMemo(() => {
    const now = Date.now();
    return (projects ?? []).map((p) => {
      const projectTasks = (tasks ?? []).filter((t) => t.projectId === p.id);
      const open = projectTasks.filter(
        (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
      );
      const completedDates = projectTasks
        .filter((t) => t.completedAt)
        .map((t) => new Date(t.completedAt as string).getTime());
      const lastProgress = completedDates.length ? Math.max(...completedDates) : null;
      const daysSinceProgress =
        lastProgress != null ? Math.floor((now - lastProgress) / 86_400_000) : null;
      const hasOverdue = open.some(
        (t) => t.dueDate != null && new Date(t.dueDate).getTime() < now,
      );
      return {
        project: p,
        openCount: open.length,
        daysSinceProgress,
        stalled: computeStalled(open.length, daysSinceProgress, hasOverdue),
      };
    });
  }, [projects, tasks]);

  const stalledCount = rows.filter((r) => r.stalled).length;

  if (isLoading) {
    return (
      <div className="card card-pad">
        <div className="eyebrow mb-1.5">In motion</div>
        <p className="text-[12.5px] text-tx-3">Loading active projects…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card card-pad">
        <div className="eyebrow mb-1.5">In motion</div>
        <p className="text-[12.5px] text-danger">
          Couldn't load active projects. Is the backend running?
        </p>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="eyebrow">In motion</div>
        {stalledCount > 0 && (
          <span className="chip" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
            {stalledCount} stalled
          </span>
        )}
      </div>
      <div className="mb-3 text-sm font-semibold tracking-[-0.01em]">
        Active projects
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-tx-4">
          No active projects.{" "}
          <Link to="/goals" className="text-primary hover:underline">
            Start one from a goal
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ project, openCount, daysSinceProgress, stalled }) => {
            const area = project.areaId ? areaById.get(project.areaId) : undefined;
            return (
              <div
                key={project.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--r-sm)] border px-3 py-2",
                  stalled
                    ? "border-danger/30 bg-danger/5"
                    : "border-line bg-surface-2",
                )}
              >
                {stalled ? (
                  <AlertTriangle className="size-3.5 shrink-0 text-danger" />
                ) : (
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: area?.color ?? "var(--acc)" }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{project.title}</div>
                  <div className="text-[11px] text-tx-3">
                    {area?.name ?? "No area"} · {openCount} open
                    {stalled &&
                      (daysSinceProgress != null
                        ? ` · ${daysSinceProgress}d since progress`
                        : " · no progress yet")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
