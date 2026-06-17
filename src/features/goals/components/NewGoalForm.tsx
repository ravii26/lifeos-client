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

import { useCreateGoalMutation } from "../goalsApi";
import { STATUSES } from "../constants";
import type { GoalStatus } from "../types";

export function NewGoalForm({
  areas,
  onClose,
}: {
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState(areas[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<GoalStatus>("ACTIVE");
  const [deadline, setDeadline] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createGoal, { isLoading }] = useCreateGoalMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !areaId) return;
    setFieldErrors({});
    setFormError(null);
    try {
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
        </div>
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim() || !areaId}>
          {isLoading ? "Adding…" : "Add goal"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
