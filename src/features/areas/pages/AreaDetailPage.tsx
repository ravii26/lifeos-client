import { createElement, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Flame,
  FolderKanban,
  ListChecks,
  Repeat,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Donut } from "@/components/charts/Donut";
import { Sparkline } from "@/components/charts/Sparkline";
import { useCompleteTaskMutation, useListTasksQuery } from "@/features/tasks/tasksApi";
import { useListHabitsQuery } from "@/features/habits/habitsApi";
import { useListGoalsQuery, useListProjectsQuery } from "@/features/goals/goalsApi";
import { useActiveFocus } from "@/features/focus/useActiveFocus";
import type { Task } from "@/features/tasks/types";
import type { Habit } from "@/features/habits/types";
import type { Goal, Project } from "@/features/goals/types";

import { useListAreasQuery, useListAreaSnapshotsQuery } from "../areasApi";
import { areaIcon } from "../constants";

// ─── helpers ───────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff6b81",
  HIGH: "#ff9d4d",
  MEDIUM: "#4f8cff",
  LOW: "var(--tx-4)",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  PARKED: "Parked",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  ABANDONED: "Abandoned",
};

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── sub-components ────────────────────────────────────────────────────────

function SectionCard({
  icon,
  label,
  count,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-surface-3 text-tx-3">
          {icon}
        </span>
        <span className="text-[13px] font-semibold tracking-[-0.01em]">{label}</span>
        {count != null && (
          <span className="ml-auto font-mono text-[11px] text-tx-4">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function TaskItem({
  task,
  color,
  onComplete,
}: {
  task: Task;
  color: string;
  onComplete: (id: string, title: string) => void;
}) {
  const isDone = task.status === "COMPLETED";
  return (
    <div
      className="flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-2"
    >
      <button
        type="button"
        onClick={() => !isDone && onComplete(task.id, task.title)}
        className="mt-0.5 shrink-0 transition-opacity hover:opacity-70"
        title={isDone ? "Completed" : "Mark done"}
      >
        {isDone ? (
          <CheckCircle2 className="size-4" style={{ color }} />
        ) : (
          <Circle className="size-4 text-tx-4" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={`truncate text-[13px] ${isDone ? "text-tx-4 line-through" : "text-tx"}`}
        >
          {task.title}
        </div>
        {task.priority && (
          <span
            className="font-mono text-[10px]"
            style={{ color: PRIORITY_COLOR[task.priority] ?? "var(--tx-4)" }}
          >
            {task.priority}
          </span>
        )}
      </div>
      {task.dueDate && (
        <span className="shrink-0 font-mono text-[10px] text-tx-4">
          {new Date(task.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </div>
  );
}

function HabitItem({ habit, color }: { habit: Habit; color: string }) {
  const daysLogged = habit.history?.filter(Boolean).length ?? 0;
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-2">
      <span
        className="grid size-5 shrink-0 place-items-center rounded"
        style={{ background: `${color}22`, color }}
      >
        <Repeat className="size-3" />
      </span>
      <span className="flex-1 min-w-0 truncate text-[13px] text-tx">{habit.title}</span>
      {habit.currentStreak != null && habit.currentStreak > 0 && (
        <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color }}>
          <Flame className="size-3" />
          {habit.currentStreak}
        </span>
      )}
      <span className="font-mono text-[10px] text-tx-4">{daysLogged}/7</span>
    </div>
  );
}

function GoalItem({ goal }: { goal: Goal }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-2">
      <Flag
        className="size-3.5 shrink-0"
        style={{
          color:
            goal.status === "COMPLETED"
              ? "var(--ok)"
              : goal.status === "ABANDONED"
                ? "var(--tx-4)"
                : "var(--acc)",
        }}
      />
      <span className="flex-1 min-w-0 truncate text-[13px] text-tx">{goal.title}</span>
      <span className="font-mono text-[10px] text-tx-4">{STATUS_LABEL[goal.status]}</span>
    </div>
  );
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-2">
      <FolderKanban className="size-3.5 shrink-0 text-tx-4" />
      <span className="flex-1 min-w-0 truncate text-[13px] text-tx">{project.title}</span>
      <span className="font-mono text-[10px] text-tx-4">{STATUS_LABEL[project.status]}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="px-2.5 py-3 text-[12px] text-tx-4">{label}</p>
  );
}

// ─── main page ─────────────────────────────────────────────────────────────

export function AreaDetailPage() {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const focus = useActiveFocus();
  const [taskFilter, setTaskFilter] = useState<"open" | "all">("open");

  const { data: areas } = useListAreasQuery();
  const area = areas?.find((a) => a.id === areaId);

  const { data: snapshots } = useListAreaSnapshotsQuery(
    { id: areaId!, limit: 30 },
    { skip: !areaId },
  );

  const { data: allTasks } = useListTasksQuery();
  const { data: allHabits } = useListHabitsQuery();
  const { data: allGoals } = useListGoalsQuery();
  const { data: allProjects } = useListProjectsQuery();
  const [completeTask] = useCompleteTaskMutation();

  const tasks = useMemo(
    () => (allTasks ?? []).filter((t) => t.areaId === areaId),
    [allTasks, areaId],
  );
  const habits = useMemo(
    () => (allHabits ?? []).filter((h) => h.areaId === areaId),
    [allHabits, areaId],
  );
  const goals = useMemo(
    () => (allGoals ?? []).filter((g) => g.areaId === areaId),
    [allGoals, areaId],
  );
  const projects = useMemo(
    () => (allProjects ?? []).filter((p) => p.areaId === areaId),
    [allProjects, areaId],
  );

  // Score history for sparkline (oldest → newest)
  const scoreSeries = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    return [...snapshots]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((s) => s.score);
  }, [snapshots]);

  // Stats
  const tasksDone = tasks.filter((t) => t.status === "COMPLETED").length;
  const tasksTotal = tasks.length;
  const score =
    area?.score != null
      ? area.score
      : tasksTotal
        ? Math.round((tasksDone / tasksTotal) * 100)
        : 0;

  const displayedTasks =
    taskFilter === "open"
      ? tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
      : tasks;

  const handleComplete = async (id: string, title: string) => {
    await completeTask(id);
    toast.success(`"${title}" done`);
  };

  // Area not found guard
  if (areas && !area) {
    return (
      <div className="page rise">
        <p className="text-sm text-tx-3">Area not found.</p>
        <Link to="/areas" className="mt-4 ds-btn ghost inline-flex">
          ← Back to Areas
        </Link>
      </div>
    );
  }

  const color = area?.color ?? "var(--acc)";
  const IconEl = area ? createElement(areaIcon(area.icon), { className: "size-5" }) : null;

  return (
    <div className="page rise">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate("/areas")}
        className="mb-5 flex items-center gap-1.5 text-[13px] text-tx-3 transition-colors hover:text-tx"
      >
        <ArrowLeft className="size-3.5" />
        Life Areas
      </button>

      {/* Header */}
      <div className="card raised card-pad mb-[var(--gap)] overflow-hidden relative">
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 0% 0%, ${color}28, transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: color }}
        />

        <div className="relative flex items-start gap-5">
          {/* Icon badge */}
          <span
            className="grid size-12 shrink-0 place-items-center rounded-xl text-xl"
            style={{ background: `${color}20`, color }}
          >
            {IconEl}
          </span>

          <div className="flex-1 min-w-0">
            <div
              className="eyebrow mb-0.5"
              style={{ color }}
            >
              {area?.type ?? "PRIMARY"} area
            </div>
            <h1 className="h-display text-[24px] leading-tight">{area?.name ?? "…"}</h1>
            {!area?.isActive && (
              <span className="font-mono text-[11px] tracking-widest text-tx-4 uppercase">
                Inactive
              </span>
            )}
          </div>

          {/* Score ring */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <Donut value={score} size={80} stroke={8} color={color}>
              <span className="font-mono text-[20px] font-semibold">{score}</span>
            </Donut>
            <span className="font-mono text-[10px] text-tx-4">score</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-5 grid grid-cols-4 gap-3">
          {[
            {
              icon: <ListChecks className="size-3.5" />,
              label: "Tasks",
              val: `${tasksDone}/${tasksTotal}`,
            },
            {
              icon: <Repeat className="size-3.5" />,
              label: "Habits",
              val: `${habits.length}`,
            },
            {
              icon: <Flag className="size-3.5" />,
              label: "Goals",
              val: `${goals.length}`,
            },
            {
              icon: <Clock className="size-3.5" />,
              label: "Focus",
              val: area?.focusMins ? formatDuration(area.focusMins) : "—",
            },
          ].map(({ icon, label, val }) => (
            <div
              key={label}
              className="rounded-lg border border-line bg-surface-2 px-3 py-2.5"
            >
              <div className="mb-1 flex items-center gap-1.5 text-tx-4">{icon}</div>
              <div className="font-mono text-[16px] font-semibold text-tx">{val}</div>
              <div className="font-mono text-[10px] text-tx-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Streak badge */}
        {area?.streak != null && area.streak > 0 && (
          <div
            className="relative mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold"
            style={{ background: `${color}18`, color }}
          >
            <Flame className="size-3.5" />
            {area.streak}-day streak
          </div>
        )}
      </div>

      {/* Score history */}
      {scoreSeries.length >= 2 && (
        <div className="card card-pad mb-[var(--gap)]">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="size-3.5 text-tx-4" />
            <span className="text-[13px] font-semibold">Score history</span>
            <span className="ml-auto font-mono text-[11px] text-tx-4">
              last {scoreSeries.length} snapshots
            </span>
          </div>
          <Sparkline data={scoreSeries} color={color} height={64} />
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-[var(--gap)] flex gap-2">
        <button
          type="button"
          onClick={() => focus.start()}
          disabled={!!focus.active || focus.starting}
          className="ds-btn acc"
        >
          <Zap className="size-3.5" />
          Start focus
        </button>
        <Link to="/tasks" className="ds-btn ghost">
          <ListChecks className="size-3.5" />
          Add task
        </Link>
        <Link to="/calendar" className="ds-btn ghost">
          <Calendar className="size-3.5" />
          Schedule
        </Link>
      </div>

      {/* Content grid */}
      <div className="grid gap-[var(--gap)] lg:grid-cols-2">
        {/* Tasks */}
        <SectionCard
          icon={<ListChecks className="size-3.5" />}
          label="Tasks"
          count={tasks.length}
        >
          {/* filter toggle */}
          <div className="mb-2 flex gap-1">
            {(["open", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTaskFilter(f)}
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                  taskFilter === f
                    ? "bg-surface-3 text-tx"
                    : "text-tx-4 hover:text-tx"
                }`}
              >
                {f === "open" ? "Open" : "All"}
              </button>
            ))}
          </div>

          {displayedTasks.length > 0 ? (
            <div className="flex flex-col">
              {displayedTasks.slice(0, 8).map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  color={color}
                  onComplete={handleComplete}
                />
              ))}
              {displayedTasks.length > 8 && (
                <Link
                  to="/tasks"
                  className="mt-1 px-2.5 text-[11px] text-tx-3 hover:text-tx"
                >
                  +{displayedTasks.length - 8} more — View all
                </Link>
              )}
            </div>
          ) : (
            <EmptyState label="No open tasks in this area." />
          )}
        </SectionCard>

        {/* Habits */}
        <SectionCard
          icon={<Repeat className="size-3.5" />}
          label="Habits"
          count={habits.length}
        >
          {habits.length > 0 ? (
            <div className="flex flex-col">
              {habits.map((h) => (
                <HabitItem key={h.id} habit={h} color={color} />
              ))}
            </div>
          ) : (
            <EmptyState label="No habits in this area." />
          )}
        </SectionCard>

        {/* Goals */}
        <SectionCard
          icon={<Flag className="size-3.5" />}
          label="Goals"
          count={goals.length}
        >
          {goals.length > 0 ? (
            <div className="flex flex-col">
              {goals.map((g) => (
                <GoalItem key={g.id} goal={g} />
              ))}
            </div>
          ) : (
            <EmptyState label="No goals in this area." />
          )}
        </SectionCard>

        {/* Projects */}
        <SectionCard
          icon={<FolderKanban className="size-3.5" />}
          label="Projects"
          count={projects.length}
        >
          {projects.length > 0 ? (
            <div className="flex flex-col">
              {projects.map((p) => (
                <ProjectItem key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState label="No projects in this area." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
