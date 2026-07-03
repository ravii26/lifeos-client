import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateProjectMutation, useUpdateProjectMutation } from "../goalsApi";
import type { Project } from "../types";

/** Compact inline form — area & goal are inherited from the parent goal. */
export function NewProjectForm({
  areaId,
  goalId,
  project,
  onClose,
}: {
  areaId: string;
  goalId: string;
  /** When provided, the form edits this project instead of creating one. */
  project?: Project;
  onClose: () => void;
}) {
  const isEdit = !!project;
  const [title, setTitle] = useState(project?.title ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const isLoading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      if (isEdit) {
        await updateProject({ id: project.id, data: { title: title.trim() } }).unwrap();
      } else {
        await createProject({ title: title.trim(), areaId, goalId }).unwrap();
        setTitle("");
      }
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
          {isLoading ? "…" : isEdit ? "Save" : "Add"}
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
