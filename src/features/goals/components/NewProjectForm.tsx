import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateProjectMutation } from "../goalsApi";

/** Compact inline form — area & goal are inherited from the parent goal. */
export function NewProjectForm({
  areaId,
  goalId,
  onClose,
}: {
  areaId: string;
  goalId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createProject({ title: title.trim(), areaId, goalId }).unwrap();
      setTitle("");
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New project…"
          aria-invalid={!!fieldErrors.title}
          autoFocus
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !title.trim()}
          className="h-8"
        >
          {isLoading ? "…" : "Add"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8"
        >
          Cancel
        </Button>
      </div>
      {(fieldErrors.title || formError) && (
        <p className="text-xs text-danger">{fieldErrors.title ?? formError}</p>
      )}
    </form>
  );
}
