import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import type { Area } from "@/features/areas/types";

import { useCreateTopicMutation } from "../knowledgeApi";
import { MASTERY_LEVELS } from "../constants";
import type { MasteryLevel } from "../types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

export function NewTopicForm({
  areas,
  onClose,
}: {
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState(areas[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [masteryLevel, setMasteryLevel] = useState<MasteryLevel>("BEGINNER");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createTopic, { isLoading }] = useCreateTopicMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !areaId) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createTopic({
        title: title.trim(),
        areaId,
        masteryLevel,
        ...(description.trim() ? { description: description.trim() } : {}),
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
        <Label htmlFor="topic-title">Title</Label>
        <Input
          id="topic-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. System Design"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="topic-desc">Description</Label>
        <textarea
          id="topic-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — what is this topic about?"
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="topic-area">Area</Label>
          <select
            id="topic-area"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            aria-invalid={!!fieldErrors.areaId}
            className={selectClass}
          >
            <option value="" disabled>
              Select an area…
            </option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {fieldErrors.areaId && (
            <p className="text-xs text-danger">{fieldErrors.areaId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic-mastery">Mastery</Label>
          <select
            id="topic-mastery"
            value={masteryLevel}
            onChange={(e) => setMasteryLevel(e.target.value as MasteryLevel)}
            className={selectClass}
          >
            {MASTERY_LEVELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim() || !areaId}>
          {isLoading ? "Adding…" : "Add topic"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
