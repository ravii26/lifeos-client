import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Pause, Play, X } from "lucide-react";
import { toast } from "sonner";

import { useListAreasQuery } from "@/features/areas/areasApi";
import { runMutation } from "@/lib/run-mutation";
import {
  useCompleteTaskMutation,
  useListTasksQuery,
} from "@/features/tasks/tasksApi";
import type { Task } from "@/features/tasks/types";
import { PRIORITY_BY_VALUE } from "@/features/tasks/constants";

import { useActiveFocus } from "../useActiveFocus";
import { useListFocusQuery } from "../focusApi";

/** Full-screen "one thing" deep-work view. Rendered outside the app shell. */
export function ImmersiveMode() {
  const navigate = useNavigate();
  const focus = useActiveFocus();
  const { data: tasks } = useListTasksQuery();
  const { data: areas } = useListAreasQuery();
  const { data: sessions } = useListFocusQuery();
  const [completeTask] = useCompleteTaskMutation();

  const areaById = useMemo(
    () => new Map((areas ?? []).map((a) => [a.id, a])),
    [areas],
  );

  const open = useMemo(
    () =>
      (tasks ?? []).filter(
        (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
      ),
    [tasks],
  );

  const activeTask = focus.active?.taskId
    ? (tasks ?? []).find((t) => t.id === focus.active!.taskId)
    : null;

  const activeArea = activeTask?.areaId
    ? areaById.get(activeTask.areaId)
    : undefined;

  // Sessions completed today
  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();
    return (sessions ?? []).filter(
      (s) => s.endedAt && new Date(s.endedAt).toDateString() === today,
    ).length;
  }, [sessions]);

  // Accent color: area color when task linked, otherwise CSS --acc
  const glowColor = activeArea?.color ?? "var(--acc)";

  const handleComplete = async () => {
    if (activeTask) {
      await runMutation(completeTask, activeTask.id, {
        onSuccess: () => toast.success(`"${activeTask.title}" completed`),
        errorMessage: "Couldn't complete task",
      });
    }
    focus.stop();
  };

  const handleStop = () => {
    focus.stop();
  };

  // Refs so the keyboard handler always reads the latest values without
  // needing to re-attach the listener on every render.
  const focusRef = useRef(focus);
  const openRef = useRef(open);
  useLayoutEffect(() => {
    focusRef.current = focus;
    openRef.current = open;
  });

  // Space bar → start/stop
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (focusRef.current.active) focusRef.current.stop();
        else if (openRef.current[0]) focusRef.current.start(openRef.current[0].id);
      }
      if (e.code === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-bg"
      style={{ animation: "fade .25s" }}
    >
      {/* Top bar */}
      <div className="relative flex items-center justify-between border-b-2 border-tx px-7 py-[18px]">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[17px] font-[850] tracking-tight text-tx">
            LifeOS<span style={{ color: glowColor }}>.</span>
          </span>
          <span className="font-display text-[15px] font-semibold text-tx-3">Immersive</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="ds-btn ghost sm"
        >
          <X className="size-3.5" /> Exit
        </button>
      </div>

      {/* Centre */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-10">
        {/* Eyebrow */}
        <div
          className="eyebrow transition-colors duration-700"
          style={{ color: focus.active ? glowColor : "var(--tx-3)" }}
        >
          {focus.active ? "In deep work" : "Choose your one thing"}
        </div>

        {/* Timer + status frame — a bordered bracket, not a soft halo */}
        <div className="relative flex items-center justify-center">
          {focus.active && (
            <div
              className="absolute border-2"
              style={{
                inset: "-28px",
                borderColor: glowColor,
                animation: "breathe 2.6s ease-in-out infinite",
              }}
            />
          )}

          {/* Timer digits */}
          <div
            className="relative font-display font-[560] tabular-nums transition-all duration-700"
            style={{
              fontSize: "clamp(64px, 13vw, 130px)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: focus.active ? glowColor : "var(--tx-4)",
            }}
          >
            {focus.active ? focus.label : "00:00"}
          </div>
        </div>

        {/* Task title + context chips */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="h-display max-w-[560px] text-[22px] leading-[1.25]"
            style={{
              color: activeTask ? "var(--tx)" : "var(--tx-3)",
            }}
          >
            {activeTask
              ? activeTask.title
              : focus.active
                ? "Focused session"
                : "Pick a task to begin."}
          </div>

          {/* Area + priority chips */}
          {activeTask && (
            <div className="flex items-center gap-2 pt-0.5">
              {activeArea && (
                <span
                  className="chip text-[11px]"
                  style={{ color: activeArea.color }}
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: activeArea.color }}
                  />
                  {activeArea.name}
                </span>
              )}
              {activeTask.priority && (
                <span
                  className="chip text-[11px]"
                  style={{ color: PRIORITY_BY_VALUE[activeTask.priority].hex }}
                >
                  {PRIORITY_BY_VALUE[activeTask.priority].label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {!focus.active ? (
          <TaskPicker
            tasks={open.slice(0, 5)}
            areaById={areaById}
            onPick={(taskId) => focus.start(taskId)}
            onBlank={() => focus.start()}
          />
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleStop}
              disabled={focus.stopping}
              className="ds-btn"
              style={{ minWidth: 140 }}
            >
              <Pause className="size-4" /> Stop &amp; log
            </button>
            {activeTask && (
              <button
                type="button"
                onClick={handleComplete}
                className="ds-btn"
                style={{
                  minWidth: 140,
                  background: glowColor,
                  color: "#ffffff",
                  border: "2px solid var(--tx)",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <Check className="size-4" /> Complete
              </button>
            )}
          </div>
        )}

        {/* Footer: session count + keyboard hint */}
        <div className="mt-2 flex flex-col items-center gap-1.5">
          {todaySessions > 0 && (
            <div className="font-mono text-[11px] text-tx-4">
              {todaySessions} session{todaySessions !== 1 ? "s" : ""} logged today
            </div>
          )}
          <div className="font-mono text-[10px] text-tx-4">
            {focus.active ? "space · pause" : "space · start"} &nbsp;·&nbsp; esc · exit
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Task picker ─────────────────────────────────────────────────── */

function TaskPicker({
  tasks,
  areaById,
  onPick,
  onBlank,
}: {
  tasks: Task[];
  areaById: Map<string, { color: string; name: string }>;
  onPick: (id: string) => void;
  onBlank: () => void;
}) {
  if (tasks.length === 0) {
    return (
      <button
        type="button"
        onClick={onBlank}
        className="ds-btn acc"
        style={{ minWidth: 200 }}
      >
        <Play className="size-4" /> Start a blank session
      </button>
    );
  }

  return (
    <div className="flex w-[min(460px,90vw)] flex-col gap-2">
      {tasks.map((t) => {
        const area = t.areaId ? areaById.get(t.areaId) : undefined;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t.id)}
            className="group flex items-center justify-between rounded-[var(--r-md)] border-2 border-tx bg-surface-2 px-4 py-3 transition-all hover:border-acc-line hover:bg-surface-2"
            style={{
              ["--hover-glow" as string]: area?.color ?? "var(--acc)",
            }}
          >
            <span className="flex items-center gap-3">
              <span
                className="size-2 shrink-0 rounded-full transition-all group-hover:shadow-[0_0_8px_currentColor]"
                style={{ background: area?.color ?? "var(--tx-3)", color: area?.color ?? "var(--tx-3)" }}
              />
              <span className="font-medium text-[14px] text-tx-2 group-hover:text-tx">
                {t.title}
              </span>
            </span>
            <Play className="size-3.5 text-tx-4 group-hover:text-primary" />
          </button>
        );
      })}

      <button
        type="button"
        onClick={onBlank}
        className="mt-1 text-[12px] text-tx-4 hover:text-tx-2 transition-colors"
      >
        or start a blank session
      </button>
    </div>
  );
}
