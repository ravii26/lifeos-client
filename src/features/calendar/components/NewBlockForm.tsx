import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import type { Area } from "@/features/areas/types";

import { useCreateCalendarMutation } from "../calendarApi";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function NewBlockForm({
  date,
  areas,
  onClose,
}: {
  date: string; // YYYY-MM-DD the calendar is currently showing
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [blockType, setBlockType] = useState("FOCUS");
  const [areaId, setAreaId] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createBlock, { isLoading }] = useCreateCalendarMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);

    // Backend rejects endTime <= startTime — catch it before the round-trip.
    if (end <= start) {
      setFormError("End time must be after start time.");
      return;
    }

    try {
      await createBlock({
        title: title.trim(),
        startTime: toIso(date, start),
        endTime: toIso(date, end),
        blockType: blockType.trim() || "FOCUS",
        ...(areaId ? { areaId } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
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
        <Label htmlFor="block-title">Title</Label>
        <Input
          id="block-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Deep work — API design"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="block-start">Start</Label>
          <Input
            id="block-start"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="[color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-end">End</Label>
          <Input
            id="block-end"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={!!fieldErrors.endTime}
            className="[color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-type">Type</Label>
          <Input
            id="block-type"
            value={blockType}
            onChange={(e) => setBlockType(e.target.value)}
            placeholder="FOCUS"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-area">Area</Label>
          <select
            id="block-area"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className={selectClass}
          >
            <option value="">None</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="block-notes">Notes</Label>
        <textarea
          id="block-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? "Adding…" : "Add block"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
