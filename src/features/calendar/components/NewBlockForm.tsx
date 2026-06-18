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

import { useCreateCalendarMutation } from "../calendarApi";
import { buildRule, NO_RECURRENCE, type RecurrenceState } from "../recurrence";
import { RecurrencePicker } from "./RecurrencePicker";

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function NewBlockForm({
  date,
  areas,
  onClose,
}: {
  date: string;
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [blockType, setBlockType] = useState("FOCUS");
  const [areaId, setAreaId] = useState("");
  const [notes, setNotes] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceState>(NO_RECURRENCE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createBlock, { isLoading }] = useCreateCalendarMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);

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
        ...(buildRule(recurrence)
          ? { recurrenceRule: buildRule(recurrence) }
          : {}),
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
          <DateInput
            id="block-start"
            variant="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block-end">End</Label>
          <DateInput
            id="block-end"
            variant="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={!!fieldErrors.endTime}
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
          <Label>Area</Label>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="mt-4">
        <RecurrencePicker value={recurrence} onChange={setRecurrence} />
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
