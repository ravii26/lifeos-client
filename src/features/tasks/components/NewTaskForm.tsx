import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
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
          <Label>Area</Label>
          <Select value={areaId} onValueChange={(v) => { setAreaId(v); setGoalId(""); setProjectId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="No area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No area</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {areaId && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Goal</Label>
            <Select value={goalId} onValueChange={(v) => { setGoalId(v); setProjectId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="No goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No goal</SelectItem>
                {(goals ?? []).map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {goalId && (
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {(projects ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label} — {t.hint}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          <DateInput
            id="task-due"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
            <Label>Frequency</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recurrence === "WEEKLY" && (
              <p className="text-[11px] text-tx-3">
                Repeats once per week. To track specific days (e.g. Mon/Wed/Fri), create a habit instead.
              </p>
            )}
            {(recurrence === "MONTHLY" || recurrence === "YEARLY") && (
              <p className="text-[11px] text-tx-3">
                Repeats once per {recurrence === "MONTHLY" ? "month" : "year"} from the due date.
              </p>
            )}
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
