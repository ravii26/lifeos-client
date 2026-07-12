import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Check, Play, Zap } from "lucide-react";
import { toast } from "sonner";

import { selectCurrentUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/store/hooks";
import { useGetSettingsQuery } from "@/features/settings/settingsApi";
import { useVibe, useVibeConfig } from "@/features/settings/useVibe";
import { runMutation } from "@/lib/run-mutation";
import { formatLongDate } from "@/lib/date";
import { Donut } from "@/components/charts/Donut";
import { Sparkline } from "@/components/charts/Sparkline";
import { useListAreasQuery } from "@/features/areas/areasApi";
import {
  useCompleteTaskMutation,
  useListTasksQuery,
} from "@/features/tasks/tasksApi";
import { TaskRow } from "@/features/tasks/components/TaskRow";
import { useListHabitsQuery } from "@/features/habits/habitsApi";
import { useActiveFocus } from "@/features/focus/useActiveFocus";

import { ActiveProjectsCard } from "../components/ActiveProjectsCard";
import { FocusCard } from "../components/FocusCard";
import { FocusTrendCard } from "../components/FocusTrendCard";
import { QuickHabitRow } from "../components/QuickHabitRow";
import { WhatNowCard } from "../components/WhatNowCard";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const START_TAB_ROUTES: Record<string, string> = { areas: "/areas", dump: "/dump" };

// Module-level flag: the start-tab redirect fires exactly once per page load,
// not on every re-mount of DashboardPage (which would trap the user in a loop).
let startTabApplied = false;

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const firstName = user?.name.split(" ")[0];
  const focus = useActiveFocus();
  const navigate = useNavigate();
  const { data: settings } = useGetSettingsQuery();
  const vibe = useVibe();
  const cfg = useVibeConfig();
  const [showAllTasks, setShowAllTasks] = useState(false);

  // On first render after settings load, honour the user's startTab preference.
  useEffect(() => {
    if (!settings || startTabApplied) return;
    startTabApplied = true;
    const route = START_TAB_ROUTES[settings.startTab];
    if (route) navigate(route, { replace: true });
  }, [settings, navigate]);

  const { data: areas } = useListAreasQuery();
  const { data: tasks } = useListTasksQuery();
  const { data: habits } = useListHabitsQuery({ isActive: true });
  const [completeTask] = useCompleteTaskMutation();

  const areaById = useMemo(
    () => new Map((areas ?? []).map((a) => [a.id, a])),
    [areas],
  );

  // Per-area stats: prefer server-computed score/tasksDone/tasksTotal when present.
  const areaStats = useMemo(() => {
    const m = new Map<string, { done: number; total: number; score: number }>();
    for (const a of areas ?? []) {
      if (a.score != null) {
        m.set(a.id, { done: a.tasksDone ?? 0, total: a.tasksTotal ?? 0, score: a.score });
      } else {
        const mine = (tasks ?? []).filter((t) => t.areaId === a.id);
        const done = mine.filter((t) => t.status === "COMPLETED").length;
        const score = mine.length ? Math.round((done / mine.length) * 100) : 0;
        m.set(a.id, { done, total: mine.length, score });
      }
    }
    return m;
  }, [areas, tasks]);

  const openTasks = useMemo(
    () =>
      (tasks ?? []).filter(
        (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
      ),
    [tasks],
  );
  const doneToday = (tasks ?? []).filter(
    (t) => t.status === "COMPLETED",
  ).length;

  // Weakest area = lowest score among areas that have tasks.
  const weakest = useMemo(() => {
    const scored = (areas ?? [])
      .map((a) => ({ area: a, ...areaStats.get(a.id)! }))
      .filter((x) => x.total > 0);
    if (scored.length === 0) return null;
    return scored.sort((a, b) => a.score - b.score)[0];
  }, [areas, areaStats]);

  // Next action: first open task in the weakest area, else any open task.
  const nextAction =
    (weakest && openTasks.find((t) => t.areaId === weakest.area.id)) ??
    openTasks[0] ??
    null;

  const avgScore = useMemo(() => {
    const vals = (areas ?? []).map((a) => areaStats.get(a.id)?.score ?? 0);
    return vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : 0;
  }, [areas, areaStats]);
  const scoreSeries = (areas ?? [])
    .map((a) => areaStats.get(a.id)?.score ?? 0)
    .sort((a, b) => a - b);

  const dayLabel = formatLongDate(new Date());

  return (
    <div className="mx-auto max-w-[1320px] px-8 pt-7 pb-20">
      {/* Page header — the date carries the weight, like the header of a
          planner's daily page, not a chat-assistant "Good morning" banner. */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-1.5">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </div>
          <h1 className="h-display text-[29px] leading-tight">{dayLabel}</h1>
          <p className="mt-1 text-sm text-tx-3">
            {openTasks.length > 0 ? (
              <>
                You're {doneToday}/{doneToday + openTasks.length} through today
                {weakest && cfg.showPressureCopy && (
                  <>
                    {" · weakest area is "}
                    <span style={{ color: weakest.area.color }}>
                      {weakest.area.name}
                    </span>
                  </>
                )}
                .
              </>
            ) : (
              "Nothing pending. A clean slate."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => focus.start()}
          disabled={!!focus.active || focus.starting}
          className="ds-btn acc"
        >
          <Play className="size-3.5" /> Start focus session
        </button>
      </div>

      {/* Vibe banner */}
      {vibe === "calm" && (
        <div className="mb-5 border-2 border-tx bg-surface-1 px-4 py-3 text-[13px] text-tx-3">
          <span className="font-bold text-tx">Calm mode.</span> Take it one step at a time. No pressure — just progress.
        </div>
      )}
      {vibe === "energetic" && (
        <div
          className="mb-5 px-4 py-3 text-[13px] font-bold text-tx"
          style={{ background: "var(--acc-soft)", border: "2px solid var(--acc)" }}
        >
          Energetic mode.{" "}
          {openTasks.length > 0
            ? `${openTasks.length} task${openTasks.length !== 1 ? "s" : ""} to crush today. Let's go.`
            : "All clear — capture something new and keep the momentum."}
        </div>
      )}

      {/* Hero row: Next action + Focus timer */}
      <div className="grid gap-[var(--gap)] lg:grid-cols-[1.45fr_1fr] lg:items-stretch">
        <div
          className="card raised relative flex flex-col overflow-hidden"
          style={{ borderLeft: `5px solid ${weakest?.area.color ?? "var(--acc)"}` }}
        >
          <div className="card-pad relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div
                className="eyebrow flex items-center gap-1.5"
                style={{ color: weakest?.area.color }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: weakest?.area.color ?? "var(--acc)",
                  }}
                />
                Next action{weakest ? " · weakest area" : ""}
              </div>
              {weakest && (
                <span className="chip">
                  {weakest.area.name} {weakest.score}
                </span>
              )}
            </div>

            <h2 className="h-display my-1.5 mt-3.5 max-w-[460px] text-[25px] leading-[1.18]">
              {nextAction
                ? nextAction.title
                : "You're all caught up. Capture something new."}
            </h2>
            <p className="m-0 max-w-[420px] text-[13px] text-tx-3">
              {nextAction
                ? weakest
                  ? `Picked because ${weakest.area.name} is your lowest-scoring area. Knock it out and watch the ring climb.`
                  : "Your top open task — start here."
                : "Nothing pressing right now. Nice work."}
            </p>

            {nextAction && (
              <div className="mt-auto flex gap-2 pt-[18px]">
                <button
                  type="button"
                  onClick={() => focus.start()}
                  disabled={!!focus.active}
                  className="ds-btn acc"
                >
                  <Zap className="size-3.5" /> Start now
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runMutation(completeTask, nextAction.id, {
                      onSuccess: () => toast.success(`"${nextAction.title}" done`),
                      errorMessage: "Couldn't complete task",
                    })
                  }
                  className="ds-btn ghost"
                >
                  <Check className="size-3.5" /> Mark done
                </button>
                <Link to="/tasks" className="ds-btn ghost">
                  Defer
                </Link>
              </div>
            )}
          </div>
        </div>

        <FocusCard />
      </div>

      {/* What Now — decision engine */}
      <div className="mt-[var(--gap)]">
        <WhatNowCard />
      </div>

      {/* Row 2: life areas + momentum */}
      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.45fr_1fr]">
        <div className="card card-pad">
          <SectionHead
            eyebrow="Balance"
            title="Life areas this week"
            to="/areas"
            cta="Open Areas"
          />
          {areas && areas.length > 0 ? (
            <div className="grid grid-cols-3 gap-3.5">
              {areas.map((a) => {
                const st = areaStats.get(a.id)!;
                return (
                  <Link
                    key={a.id}
                    to={`/areas/${a.id}`}
                    className="relative flex flex-col items-center gap-2 border-2 border-tx bg-surface-2 px-3 py-3.5 transition-colors hover:bg-surface-3"
                    style={cfg.showAlerts && st.score < 40 ? { borderColor: "var(--danger)" } : undefined}
                  >
                    {cfg.showAlerts && st.score < 40 && (
                      <AlertTriangle className="absolute top-2 right-2 size-3 text-danger" />
                    )}
                    <Donut value={st.score} size={74} stroke={7} color={cfg.showAlerts && st.score < 40 ? "var(--danger)" : a.color}>
                      <span className="font-display text-[19px] font-[800] tabular-nums">
                        {st.score}
                      </span>
                    </Donut>
                    <div className="text-center">
                      <div
                        className="text-[12.5px] font-bold"
                        style={{ color: a.color }}
                      >
                        {a.name}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-tx-3">
                        {st.done}/{st.total}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-tx-4">No areas yet.</p>
          )}
        </div>

        <div className="flex flex-col gap-[var(--gap)]">
          {weakest && cfg.showAlerts && (
            <div
              className="card card-pad"
              style={{ borderLeft: "5px solid var(--danger)" }}
            >
              <div
                className="eyebrow mb-2 flex items-center gap-1.5"
                style={{ color: "var(--danger)" }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: "var(--danger)" }}
                />
                Needs attention
              </div>
              <div className="mb-1 text-[15px] font-[700]">
                {weakest.area.name} is your weakest area
              </div>
              <p className="m-0 mb-3 text-[13px] text-tx-3">
                Scoring {weakest.score}. Schedule a block before it drags your
                average down.
              </p>
              <div className="flex gap-2">
                <Link to="/calendar" className="ds-btn acc sm">
                  Schedule
                </Link>
                <Link to="/areas" className="ds-btn ghost sm">
                  View area
                </Link>
              </div>
            </div>
          )}
          <div className="card card-pad flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="eyebrow">Average score</div>
              <span className="chip" style={{ color: "var(--ok)" }}>
                {areas?.length ?? 0} areas
              </span>
            </div>
            <div className="my-1.5 font-display text-[30px] font-[900] tabular-nums leading-none">
              {avgScore}
              <span className="text-sm text-tx-3"> avg</span>
            </div>
            <Sparkline data={scoreSeries} color="var(--acc)" height={56} />
          </div>
          <FocusTrendCard />
        </div>
      </div>

      {/* Row 2.5: cross-goal active projects — the same "what's stalling" view
          the AI recommender already computes for itself, surfaced directly. */}
      <div className="mt-[var(--gap)]">
        <ActiveProjectsCard />
      </div>

      {/* Row 3: today + quick habits */}
      <div className="mt-[var(--gap)] grid items-start gap-[var(--gap)] lg:grid-cols-[1.45fr_1fr]">
        <div className="card card-pad">
          <SectionHead
            eyebrow={`${doneToday} done`}
            title="Today"
            to="/tasks"
            cta="All tasks"
          />
          {openTasks.length > 0 ? (
            (() => {
              // calm caps the list short (cfg.taskLimit); the dashboard otherwise
              // shows up to 6. "Show more" reveals the rest without losing data.
              const baseLimit = cfg.taskLimit ?? 6;
              const limit = showAllTasks ? openTasks.length : baseLimit;
              const shown = openTasks.slice(0, limit);
              const remaining = openTasks.length - shown.length;
              return (
                <div className="flex flex-col gap-2">
                  {shown.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      area={t.areaId ? areaById.get(t.areaId) : undefined}
                    />
                  ))}
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTasks(true)}
                      className="mt-1 self-start text-xs text-tx-3 hover:text-tx"
                    >
                      Show {remaining} more
                    </button>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-tx-4">
              No open tasks.{" "}
              <Link to="/tasks" className="text-primary hover:underline">
                Add one
              </Link>
              .
            </p>
          )}
        </div>

        <div className="card card-pad">
          <SectionHead
            eyebrow="Quick log"
            title="Habits"
            to="/habits"
            cta="All"
          />
          {habits && habits.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {habits.slice(0, 5).map((h) => (
                <QuickHabitRow
                  key={h.id}
                  habit={h}
                  area={h.areaId ? areaById.get(h.areaId) : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-tx-4">
              No active habits.{" "}
              <Link to="/habits" className="text-primary hover:underline">
                Start one
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  to,
  cta,
}: {
  eyebrow: string;
  title: string;
  to: string;
  cta: string;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="mt-0.5 text-sm font-semibold tracking-[-0.01em]">
          {title}
        </div>
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-xs text-tx-3 hover:text-tx"
      >
        {cta} <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
