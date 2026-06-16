import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateNoteMutation } from "../knowledgeApi";
import { NOTE_TYPES } from "../constants";
import type { Notebook, NoteType } from "../types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

export function NewNoteForm({
  topicId,
  notebooks,
  onClose,
}: {
  topicId: string;
  notebooks: Notebook[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("CONCEPT");
  const [notebookId, setNotebookId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createNote, { isLoading }] = useCreateNoteMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createNote({
        title: title.trim(),
        content: content.trim(),
        topicId,
        noteType,
        ...(notebookId ? { notebookId } : {}),
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
      className="rounded-lg border border-line-2 bg-surface-2 p-4"
    >
      <div className="space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. CAP theorem"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <Label htmlFor="note-content">Content</Label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write the note…"
          rows={4}
          aria-invalid={!!fieldErrors.content}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
        {fieldErrors.content && (
          <p className="text-xs text-danger">{fieldErrors.content}</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="note-type">Type</Label>
          <select
            id="note-type"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            className={selectClass}
          >
            {NOTE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {notebooks.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="note-notebook">Notebook</Label>
            <select
              id="note-notebook"
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              className={selectClass}
            >
              <option value="">None</option>
              {notebooks.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {formError && <p className="mt-3 text-sm text-danger">{formError}</p>}

      <div className="mt-4 flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !title.trim() || !content.trim()}
        >
          {isLoading ? "Adding…" : "Add note"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
