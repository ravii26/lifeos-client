import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import type { Area } from "@/features/areas/types";
import {
  useListGoalsQuery,
  useListProjectsQuery,
} from "@/features/goals/goalsApi";

import { useCreateTaskMutation } from "../tasksApi";
import { PRIORITIES, RECURRENCES, TASK_TYPES } from "../constants";
import type { Priority, Recurrence, TaskType } from "../types";

// Shared native-select styling (matches the Input look, dark color-scheme).
const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

export function NewTaskForm({
  areas,
  onClose,
}: {
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [goalId, setGoalId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [taskType, setTaskType] = useState<TaskType>("BOOLEAN");
  const [targetCount, setTargetCount] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>("DAILY");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createTask, { isLoading }] = useCreateTaskMutation();

  // Goals filter by the chosen area; projects filter by the chosen goal.
  const { data: goals } = useListGoalsQuery(
    areaId ? { areaId } : undefined,
  );
  const { data: projects } = useListProjectsQuery(
    goalId ? { goalId } : undefined,
    { skip: !goalId },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createTask({
        title: title.trim(),
        priority,
        taskType,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(areaId ? { areaId } : {}),
        ...(goalId ? { goalId } : {}),
        ...(projectId ? { projectId } : {}),
        // Conditional fields — only send what the chosen type expects.
        ...(taskType === "COUNT" && targetCount
          ? { targetCount: Number(targetCount) }
          : {}),
        ...(taskType === "TIMER" && targetMinutes
          ? { targetMinutes: Number(targetMinutes) }
          : {}),
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
        ...(isRecurring ? { isRecurring: true, recurrence } : {}),
      }).unwrap();
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-line bg-surface-1 p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="task-desc">Description</Label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes or context…"
          rows={2}
          aria-invalid={!!fieldErrors.description}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
        {fieldErrors.description && (
          <p className="text-xs text-danger">{fieldErrors.description}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-area">Area</Label>
          <select
            id="task-area"
            value={areaId}
            onChange={(e) => {
              setAreaId(e.target.value);
              setGoalId(""); // goals are area-scoped — reset on area change
              setProjectId("");
            }}
            className={selectClass}
          >
            <option value="">No area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={selectClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goal & project links — area-scoped, optional. */}
      {areaId && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-goal">Goal</Label>
            <select
              id="task-goal"
              value={goalId}
              onChange={(e) => {
                setGoalId(e.target.value);
                setProjectId(""); // projects are goal-scoped
              }}
              className={selectClass}
            >
              <option value="">No goal</option>
              {(goals ?? []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {goalId && (
            <div className="space-y-2">
              <Label htmlFor="task-project">Project</Label>
              <select
                id="task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={selectClass}
              >
                <option value="">No project</option>
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-type">Type</Label>
          <select
            id="task-type"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as TaskType)}
            className={selectClass}
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} — {t.hint}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional field: only the chosen type's target shows. */}
        {taskType === "COUNT" && (
          <div className="space-y-2">
            <Label htmlFor="task-target-count">Target count</Label>
            <Input
              id="task-target-count"
              type="number"
              min={1}
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              placeholder="e.g. 10"
              aria-invalid={!!fieldErrors.targetCount}
            />
            {fieldErrors.targetCount && (
              <p className="text-xs text-danger">{fieldErrors.targetCount}</p>
            )}
          </div>
        )}

        {taskType === "TIMER" && (
          <div className="space-y-2">
            <Label htmlFor="task-target-minutes">Target minutes</Label>
            <Input
              id="task-target-minutes"
              type="number"
              min={1}
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(e.target.value)}
              placeholder="e.g. 30"
              aria-invalid={!!fieldErrors.targetMinutes}
            />
            {fieldErrors.targetMinutes && (
              <p className="text-xs text-danger">{fieldErrors.targetMinutes}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="task-due">Due date</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="[color-scheme:dark]"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-lg border border-line-2 bg-surface-2 p-3">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="font-medium">Repeats</span>
        </label>

        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="task-recurrence">Frequency</Label>
            <select
              id="task-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
              className={selectClass}
            >
              {RECURRENCES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? "Adding…" : "Add task"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
