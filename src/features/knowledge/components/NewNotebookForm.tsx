import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateNotebookMutation, useUpdateNotebookMutation } from "../knowledgeApi";
import type { Notebook } from "../types";

/** Compact inline form — topic is inherited. */
export function NewNotebookForm({
  topicId,
  notebook,
  onClose,
}: {
  topicId: string;
  /** When provided, the form edits this notebook instead of creating one. */
  notebook?: Notebook;
  onClose: () => void;
}) {
  const isEdit = !!notebook;
  const [title, setTitle] = useState(notebook?.title ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createNotebook, { isLoading: creating }] = useCreateNotebookMutation();
  const [updateNotebook, { isLoading: updating }] = useUpdateNotebookMutation();
  const isLoading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      if (isEdit) {
        await updateNotebook({ id: notebook.id, data: { title: title.trim() } }).unwrap();
      } else {
        await createNotebook({ title: title.trim(), topicId }).unwrap();
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New notebook…"
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
