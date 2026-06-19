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
import { PRIORITIES } from "@/features/tasks/constants";
import type { Priority } from "@/features/tasks/types";

import { useCreateGoalMutation, useUpdateGoalMutation } from "../goalsApi";
import { getFocusError } from "../focusError";
import { STATUSES } from "../constants";
import type { Goal, GoalStatus } from "../types";

export function NewGoalForm({
  areas,
  goal,
  onClose,
}: {
  areas: Area[];
  /** When provided, the form edits this goal instead of creating one. */
  goal?: Goal;
  onClose: () => void;
}) {
  const isEdit = !!goal;
  const [title, setTitle] = useState(goal?.title ?? "");
  const [areaId, setAreaId] = useState(goal?.areaId ?? areas[0]?.id ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [priority, setPriority] = useState<Priority>(goal?.priority ?? "MEDIUM");
  // New goals default to the backlog (PARKED); activating is a deliberate act.
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? "PARKED");
  // DateInput wants `yyyy-mm-dd`; the stored deadline is a full ISO timestamp.
  const [deadline, setDeadline] = useState(goal?.deadline?.slice(0, 10) ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createGoal, { isLoading: creating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: updating }] = useUpdateGoalMutation();
  const isLoading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !areaId) return;
    setFieldErrors({});
    setFormError(null);
    try {
      if (isEdit) {
        // Status stays out of the edit form — ACTIVE/PARKED transitions must go
        // through the focus endpoints (cap enforcement), which the card owns.
        // Send null to clear optional fields that were emptied.
        await updateGoal({
          id: goal.id,
          data: {
            title: title.trim(),
            areaId,
            priority,
            description: description.trim() ? description.trim() : null,
            deadline: deadline ? new Date(deadline).toISOString() : null,
          },
        }).unwrap();
        onClose();
        return;
      }
      await createGoal({
        title: title.trim(),
        areaId,
        priority,
        status,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(deadline ? { deadline: new Date(deadline).toISOString() } : {}),
      }).unwrap();
      onClose();
    } catch (err) {
      // Hitting the focus cap (409) returns a structured object, not field
      // errors — surface it as a friendly message instead of garbled fields.
      if (getFocusError(err)?.reason === "MAX_ACTIVE_GOALS_REACHED") {
        setFormError(
          "You're already focusing on the max number of goals. Create it as parked, then activate it from the backlog.",
        );
        return;
      }
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
        <Label htmlFor="goal-title">Title</Label>
        <Input
          id="goal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Run a half marathon"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="goal-desc">Description</Label>
        <textarea
          id="goal-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — what does success look like?"
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Area</Label>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger aria-invalid={!!fieldErrors.areaId}>
              <SelectValue placeholder="Select an area…" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.areaId && (
            <p className="text-xs text-danger">{fieldErrors.areaId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-deadline">Deadline</Label>
          <DateInput
            id="goal-deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {!isEdit && (
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-tx-4">
              Parked goals sit in your backlog until you activate them.
            </p>
          </div>
        )}
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim() || !areaId}>
          {isLoading
            ? isEdit
              ? "Saving…"
              : "Adding…"
            : isEdit
              ? "Save changes"
              : "Add goal"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
