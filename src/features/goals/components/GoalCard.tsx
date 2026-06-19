import { useState } from "react";
import { ChevronDown, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import type { Area } from "@/features/areas/types";
import { PRIORITY_BY_VALUE } from "@/features/tasks/constants";

import {
  useDeleteGoalMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useParkGoalMutation,
  useUpdateGoalMutation,
} from "../goalsApi";
import { CONFIDENCE_BY_LABEL, STATUSES, STATUS_BY_VALUE, WEAKEST_LABEL } from "../constants";
import type { Goal, GoalStatus, GoalWithConfidence } from "../types";
import { ConfidenceRing } from "./ConfidenceRing";
import { NewProjectForm } from "./NewProjectForm";

function hasConfidence(g: Goal | GoalWithConfidence): g is GoalWithConfidence {
  return "confidence" in g && g.confidence != null;
}

export function GoalCard({
  goal,
  area,
  onActivate,
  onEdit,
}: {
  goal: Goal | GoalWithConfidence;
  area?: Area;
  /** Asks the page to activate this goal (it owns the focus-cap flow). */
  onActivate?: (goal: Goal) => void;
  /** Opens the edit form for this goal (the page owns the form). */
  onEdit?: (goal: Goal) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const { data: projects } = useListProjectsQuery({ goalId: goal.id });
  const [updateGoal] = useUpdateGoalMutation();
  const [parkGoal, { isLoading: parking }] = useParkGoalMutation();
  const [deleteGoal, { isLoading: deletingGoal }] = useDeleteGoalMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const status = STATUS_BY_VALUE[goal.status];
  const priority = goal.priority ? PRIORITY_BY_VALUE[goal.priority] : undefined;
  const projectCount = projects?.length ?? 0;
  const confidence = hasConfidence(goal) ? goal.confidence : undefined;
  const isActive = goal.status === "ACTIVE";
  const isParked = goal.status === "PARKED";

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${goal.title}"?`,
      description: "Its projects will be unlinked or removed.",
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    deleteGoal(goal.id);
  };

  const handlePark = async () => {
    try {
      await parkGoal(goal.id).unwrap();
      toast.success(`Parked “${goal.title}”`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't park goal");
    }
  };

  // Route ACTIVE/PARKED through the focus endpoints (they enforce the cap);
  // everything else is a plain status PATCH.
  const handleStatusChange = (v: GoalStatus) => {
    if (v === goal.status) return;
    if (v === "ACTIVE") onActivate?.(goal);
    else if (v === "PARKED") handlePark();
    else updateGoal({ id: goal.id, data: { status: v } });
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-surface-1 p-4",
        isActive ? "border-primary/40 shadow-sm" : "border-line",
        goal.status === "COMPLETED" && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {confidence && <ConfidenceRing confidence={confidence} />}
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
            {confidence && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className={cn("font-medium", CONFIDENCE_BY_LABEL[confidence.label].tone)}>
                  {CONFIDENCE_BY_LABEL[confidence.label].label}
                </span>
                <span className="text-tx-4">
                  Weakest: {WEAKEST_LABEL[confidence.weakest] ?? confidence.weakest}
                </span>
                {confidence.daysSinceProgress != null && (
                  <span className="text-tx-4">
                    {confidence.daysSinceProgress === 0
                      ? "Progress today"
                      : `${confidence.daysSinceProgress}d since progress`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(goal)}
              title="Edit goal"
              className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-tx"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletingGoal}
            title="Delete goal"
            className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Focus action + status changer + project disclosure */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isParked && onActivate && (
            <button
              type="button"
              onClick={() => onActivate(goal)}
              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <Play className="size-3" /> Activate
            </button>
          )}
          {isActive && (
            <button
              type="button"
              onClick={handlePark}
              disabled={parking}
              className="flex items-center gap-1 rounded-md border border-line-2 px-2.5 py-1 text-xs font-medium text-tx-2 transition-colors hover:bg-surface-3 disabled:opacity-50"
            >
              <Pause className="size-3" /> Park
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", status.dot)} />
            <Select
              value={goal.status}
              onValueChange={(v) => handleStatusChange(v as GoalStatus)}
            >
              <SelectTrigger className="h-auto border-0 bg-transparent px-0 py-0 text-xs font-medium text-tx-2 shadow-none focus:ring-0 [&>svg]:size-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
