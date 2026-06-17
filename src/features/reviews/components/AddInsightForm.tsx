import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import {
  useListNotesQuery,
  useListTopicsQuery,
} from "@/features/knowledge/knowledgeApi";

import { useAddInsightMutation } from "../reviewsApi";

export function AddInsightForm({
  reviewId,
  onClose,
}: {
  reviewId: string;
  onClose: () => void;
}) {
  const [topicId, setTopicId] = useState("");
  const [noteId, setNoteId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: topics } = useListTopicsQuery();
  const { data: notes } = useListNotesQuery(
    { topicId },
    { skip: !topicId },
  );
  const [addInsight, { isLoading }] = useAddInsightMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteId) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await addInsight({ reviewId, data: { noteId } }).unwrap();
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  if (topics && topics.length === 0) {
    return (
      <p className="rounded-lg border border-line-2 bg-surface-2 p-3 text-xs text-tx-3">
        Create a topic with notes first — insights link to a note.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-line-2 bg-surface-2 p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Topic</Label>
          <Select value={topicId} onValueChange={(v) => { setTopicId(v); setNoteId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic…" />
            </SelectTrigger>
            <SelectContent>
              {topics?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Note</Label>
          <Select value={noteId} onValueChange={setNoteId} disabled={!topicId}>
            <SelectTrigger aria-invalid={!!fieldErrors.noteId}>
              <SelectValue placeholder={topicId ? "Select a note…" : "Pick a topic first"} />
            </SelectTrigger>
            <SelectContent>
              {notes?.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {topicId && notes && notes.length === 0 && (
            <p className="text-xs text-tx-4">This topic has no notes yet.</p>
          )}
        </div>
      </div>

      {formError && <p className="mt-3 text-sm text-danger">{formError}</p>}

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" disabled={isLoading || !noteId}>
          {isLoading ? "Adding…" : "Add insight"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
