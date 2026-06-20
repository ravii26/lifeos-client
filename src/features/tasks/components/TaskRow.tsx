import { useMemo } from "react";
import { Check, Pause, Pencil, Play, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";
import {
  useStartFocusMutation,
  useStopFocusMutation,
  useListFocusQuery,
} from "@/features/focus/focusApi";

import {
  useCompleteTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../tasksApi";
import { PRIORITY_BY_VALUE, priStyle } from "../constants";
import type { Task } from "../types";

export function TaskRow({
  task,
  area,
  onEdit,
}: {
  task: Task;
  area?: Area;
  onEdit?: (task: Task) => void;
}) {
  const [completeTask] = useCompleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();
  const [startFocus] = useStartFocusMutation();
  const [stopFocus] = useStopFocusMutation();
  const { data: sessions } = useListFocusQuery();

  const done = task.status === "COMPLETED";
  const priority = task.priority ? PRIORITY_BY_VALUE[task.priority] : undefined;
  const activeFocus = (sessions ?? []).find(
    (sn) => !sn.endedAt && sn.durationMinutes == null,
  );
  const focusingThis = activeFocus?.taskId === task.id;

  // Real progress for TIMER tasks: sum of completed focus sessions linked to it.
  // (The backend has no completedCount-increment endpoint, so focus time is the
  // only true progress signal — an active, unstopped session isn't counted yet.)
  const loggedMinutes = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => s.taskId === task.id && s.durationMinutes != null)
        .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0),
    [sessions, task.id],
  );

  const toggle = async () => {
    if (done) {
      await updateTask({ id: task.id, data: { status: "TODO" } });
    } else {
      await completeTask(task.id);
      toast.success(`"${task.title}" done`);
    }
  };

  return (
    <div className="group flex items-center gap-[11px] rounded-[var(--r-sm)] border border-line bg-surface-2 px-3 py-[11px] transition-colors hover:border-line-2">
      <button
        type="button"
        onClick={toggle}
        title={done ? "Mark as not done" : "Mark done"}
        className={cn("check", done && "on")}
      >
        {done && <Check className="size-3" strokeWidth={2.6} />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-[13.5px] font-medium",
            done && "strike",
          )}
        >
          {task.title}
        </div>
        <div className="mt-[3px] flex items-center gap-2">
          {area && (
            <span
              className="flex items-center gap-1.5 text-[10px]"
              style={{ color: area.color }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              {area.name}
            </span>
          )}
          {task.source && task.source !== "MANUAL" && (
            <span className="chip px-1.5 py-px text-[9.5px]">
              ↳ {task.source === "LEARN" ? "from Learn" : task.source}
            </span>
          )}
          {task.taskType === "COUNT" && task.targetCount != null && (
            <span className="font-mono text-[11px] text-tx-3">
              {task.completedCount ?? 0}/{task.targetCount}
            </span>
          )}
          {task.taskType === "TIMER" && task.targetMinutes != null && (
            <span
              className="font-mono text-[11px] text-tx-3"
              title="Focused minutes / target"
            >
              {loggedMinutes}/{task.targetMinutes}m
            </span>
          )}
          {task.isRecurring && (
            <span className="flex items-center gap-1 text-[10px] text-tx-3">
              <Repeat className="size-3" />
              {task.recurrence?.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      {/* Timer tasks get a focus toggle (links the session to this task). */}
      {task.taskType === "TIMER" && !done && (
        <button
          type="button"
          onClick={() =>
            focusingThis && activeFocus
              ? stopFocus(activeFocus.id)
              : startFocus({ taskId: task.id })
          }
          className={cn("ds-btn tiny", focusingThis ? "acc" : "ghost")}
        >
          {focusingThis ? (
            <>
              <Pause className="size-3" /> Stop
            </>
          ) : (
            <>
              <Play className="size-3" /> Focus
            </>
          )}
        </button>
      )}

      {priority && (
        <span className="pri" style={priStyle(priority.hex)}>
          {priority.code}
        </span>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(task)}
          title="Edit task"
          className="grid size-6 shrink-0 place-items-center rounded-md text-tx-4 opacity-0 transition hover:bg-surface-3 hover:text-tx group-hover:opacity-100"
        >
          <Pencil className="size-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        disabled={deleting}
        title="Delete task"
        className="grid size-6 shrink-0 place-items-center rounded-md text-tx-4 opacity-0 transition hover:bg-surface-3 hover:text-danger group-hover:opacity-100 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
