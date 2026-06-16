import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";
import { PRIORITY_BY_VALUE } from "@/features/tasks/constants";

import {
  useDeleteGoalMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useUpdateGoalMutation,
} from "../goalsApi";
import { STATUSES, STATUS_BY_VALUE } from "../constants";
import type { Goal, GoalStatus } from "../types";
import { NewProjectForm } from "./NewProjectForm";

export function GoalCard({ goal, area }: { goal: Goal; area?: Area }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const { data: projects } = useListProjectsQuery({ goalId: goal.id });
  const [updateGoal] = useUpdateGoalMutation();
  const [deleteGoal, { isLoading: deletingGoal }] = useDeleteGoalMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const status = STATUS_BY_VALUE[goal.status];
  const priority = goal.priority ? PRIORITY_BY_VALUE[goal.priority] : undefined;
  const projectCount = projects?.length ?? 0;

  const handleDelete = () => {
    if (
      !window.confirm(
        `Delete "${goal.title}"? Its projects will be unlinked or removed.`,
      )
    )
      return;
    deleteGoal(goal.id);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface-1 p-4",
        goal.status === "COMPLETED" && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-sm font-semibold",
              goal.status === "COMPLETED" && "line-through",
            )}
          >
            {goal.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-tx-3">
            {area && (
              <span className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </span>
            )}
            {priority && (
              <span className={cn("text-[11px] font-medium", priority.tone)}>
                {priority.label}
              </span>
            )}
            {goal.deadline && (
              <span className="font-mono text-[10.5px]">
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deletingGoal}
          title="Delete goal"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Status changer + project disclosure */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          <select
            value={goal.status}
            onChange={(e) =>
              updateGoal({
                id: goal.id,
                data: { status: e.target.value as GoalStatus },
              })
            }
            className="bg-transparent text-xs font-medium text-tx-2 outline-none"
            title="Change status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-xs text-tx-3 hover:text-tx"
        >
          {projectCount} project{projectCount === 1 ? "" : "s"}
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-1.5 border-t border-line-2 pt-3">
          {projects?.map((p) => {
            const ps = STATUS_BY_VALUE[p.status];
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1.5"
              >
                <span className={cn("size-1.5 rounded-full", ps.dot)} />
                <span
                  className={cn(
                    "flex-1 truncate text-xs",
                    p.status === "COMPLETED" && "text-tx-4 line-through",
                  )}
                >
                  {p.title}
                </span>
                <button
                  type="button"
                  onClick={() => deleteProject(p.id)}
                  title="Delete project"
                  className="grid size-5 place-items-center rounded text-tx-4 hover:text-danger"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}

          {projectCount === 0 && !adding && (
            <p className="text-xs text-tx-4">No projects yet.</p>
          )}

          {adding ? (
            <NewProjectForm
              areaId={goal.areaId}
              goalId={goal.id}
              onClose={() => setAdding(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="size-3.5" /> Add project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
