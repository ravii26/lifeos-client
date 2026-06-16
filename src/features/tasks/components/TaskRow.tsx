import { Check, Repeat, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";

import {
  useCompleteTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../tasksApi";
import { PRIORITY_BY_VALUE } from "../constants";
import type { Task } from "../types";

export function TaskRow({ task, area }: { task: Task; area?: Area }) {
  const [completeTask] = useCompleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const done = task.status === "COMPLETED";
  const priority = task.priority ? PRIORITY_BY_VALUE[task.priority] : undefined;
  // Only HIGH/CRITICAL earn a visible badge — MEDIUM/LOW stay quiet.
  const showPriority =
    priority && (task.priority === "HIGH" || task.priority === "CRITICAL");

  const toggle = () => {
    // Completing uses the dedicated endpoint; un-completing just sets TODO.
    if (done) updateTask({ id: task.id, data: { status: "TODO" } });
    else completeTask(task.id);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
      <button
        type="button"
        onClick={toggle}
        title={done ? "Mark as not done" : "Mark done"}
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-line-3 hover:border-primary/60",
        )}
      >
        {done && <Check className="size-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-sm font-medium",
            done && "text-tx-4 line-through",
          )}
        >
          {task.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-tx-3">
          {showPriority && (
            <span
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium",
                priority.tone,
              )}
            >
              <span className={cn("size-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
          )}
          {task.taskType === "COUNT" && task.targetCount != null && (
            <span className="font-mono text-[10.5px]">
              {task.completedCount ?? 0}/{task.targetCount}
            </span>
          )}
          {task.taskType === "TIMER" && task.targetMinutes != null && (
            <span className="font-mono text-[10.5px]">
              {task.targetMinutes}m
            </span>
          )}
          {task.isRecurring && (
            <span className="flex items-center gap-1 text-[10.5px]">
              <Repeat className="size-3" />
              {task.recurrence?.toLowerCase()}
            </span>
          )}
          {area && (
            <span className="flex items-center gap-1.5 text-[11px]">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              {area.name}
            </span>
          )}
          {task.dueDate && (
            <span className="font-mono text-[10.5px]">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.source && task.source !== "MANUAL" && (
            <span className="font-mono text-[10px] text-tx-4">
              ↳ {task.source}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        disabled={deleting}
        title="Delete task"
        className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
