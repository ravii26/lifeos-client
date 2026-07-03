import { useState } from "react";
import { Repeat, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
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
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import type { Area } from "@/features/areas/types";

import {
  useDeleteCalendarMutation,
  useSplitCalendarSeriesMutation,
  useUpdateCalendarMutation,
  useUpsertCalendarExceptionMutation,
} from "../calendarApi";
import { buildRule, describeRule, parseRule, type RecurrenceState } from "../recurrence";
import { type CalendarBlock, isOccurrence } from "../types";
import { splitIso, toIso } from "../dateUtils";
import { RecurrencePicker } from "./RecurrencePicker";

/** Edit scope for a recurring occurrence. */
type Scope = "THIS" | "FOLLOWING" | "ALL";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "THIS", label: "This event" },
  { value: "FOLLOWING", label: "This and following" },
  { value: "ALL", label: "All events" },
];

export function EditBlockDialog({
  block,
  areas,
  onClose,
}: {
  block: CalendarBlock;
  areas: Area[];
  onClose: () => void;
}) {
  const recurring = isOccurrence(block);
  const seriesId = block.recurringBlockId ?? block.id;
  const occurrenceDate = block.occurrenceDate ?? block.startTime;

  const startParts = splitIso(block.startTime);
  const endParts = splitIso(block.endTime);

  const [title, setTitle] = useState(block.title);
  const [date, setDate] = useState(startParts.date);
  const [start, setStart] = useState(startParts.time);
  const [end, setEnd] = useState(endParts.time);
  const [blockType, setBlockType] = useState(block.blockType ?? "FOCUS");
  const [areaId, setAreaId] = useState(block.areaId ?? "");
  const [notes, setNotes] = useState(block.notes ?? "");
  const [recurrence, setRecurrence] = useState<RecurrenceState>(
    parseRule(block.recurrenceRule),
  );
  const [scope, setScope] = useState<Scope>("THIS");

  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [updateBlock, { isLoading: saving }] = useUpdateCalendarMutation();
  const [upsertException, { isLoading: exSaving }] =
    useUpsertCalendarExceptionMutation();
  const [splitSeries, { isLoading: splitting }] =
    useSplitCalendarSeriesMutation();
  const [deleteBlock, { isLoading: deleting }] = useDeleteCalendarMutation();

  const busy = saving || exSaving || splitting || deleting;
  // The recurrence pattern is only editable when it affects the whole series.
  const showRecurrence = !recurring || scope === "ALL" || scope === "FOLLOWING";

  const fail = (err: unknown) => {
    const { fields, message } = parseApiErrors(err as ApiError);
    setFieldErrors(fields);
    setFormError(message);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    if (end <= start) {
      setFormError("End time must be after start time.");
      return;
    }

    const startTime = toIso(date, start);
    const endTime = toIso(date, end);
    const type = blockType.trim() || "FOCUS";

    try {
      if (recurring && scope === "THIS") {
        // Override just this occurrence.
        await upsertException({
          id: seriesId,
          data: {
            occurrenceDate,
            title: title.trim(),
            startTime,
            endTime,
            blockType: type,
            notes: notes.trim() || undefined,
          },
        }).unwrap();
      } else if (recurring && scope === "FOLLOWING") {
        // Cap the current series and start a new one from here.
        await splitSeries({
          id: seriesId,
          data: {
            fromOccurrenceDate: occurrenceDate,
            title: title.trim(),
            startTime,
            endTime,
            blockType: type,
            notes: notes.trim() ? notes.trim() : null,
            areaId: areaId || null,
            ...(buildRule(recurrence)
              ? { recurrenceRule: buildRule(recurrence) }
              : {}),
          },
        }).unwrap();
      } else {
        // One-off block, or "All events" → patch the series/template.
        await updateBlock({
          id: seriesId,
          data: {
            title: title.trim(),
            startTime,
            endTime,
            blockType: type,
            notes: notes.trim() ? notes.trim() : null,
            areaId: areaId || null,
            recurrenceRule: buildRule(recurrence) ?? null,
          },
        }).unwrap();
      }
      onClose();
    } catch (err) {
      fail(err);
    }
  };

  const handleDelete = async () => {
    setFormError(null);
    try {
      if (recurring && scope === "THIS") {
        if (!(await confirm({
          title: "Delete just this occurrence?",
          confirmText: "Delete",
          danger: true,
        }))) return;
        await upsertException({
          id: seriesId,
          data: { occurrenceDate, isCancelled: true },
        }).unwrap();
      } else {
        if (!(await confirm({
          title: recurring ? "Delete the entire series?" : `Delete "${block.title}"?`,
          description: recurring ? "This removes every occurrence." : undefined,
          confirmText: "Delete",
          danger: true,
        }))) return;
        await deleteBlock(seriesId).unwrap();
      }
      onClose();
    } catch (err) {
      fail(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <form
        onSubmit={handleSave}
        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-line-2 bg-surface-1 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-tx">Edit block</h2>
            {recurring && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-tx-3">
                <Repeat className="size-3" />
                {describeRule(block.recurrenceRule)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {recurring && (
          <div className="mb-4 space-y-2">
            <Label>Apply changes to</Label>
            <div className="flex flex-wrap gap-1.5">
              {SCOPES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setScope(s.value)}
                  aria-pressed={scope === s.value}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    scope === s.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-line text-tx-3 hover:bg-surface-2",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!fieldErrors.title}
            autoFocus
          />
          {fieldErrors.title && (
            <p className="text-xs text-danger">{fieldErrors.title}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <DateInput
              id="edit-date"
              variant="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={recurring && scope === "ALL"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Input
              id="edit-type"
              value={blockType}
              onChange={(e) => setBlockType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-start">Start</Label>
            <DateInput
              id="edit-start"
              variant="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-end">End</Label>
            <DateInput
              id="edit-end"
              variant="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              aria-invalid={!!fieldErrors.endTime}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>Area</Label>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="edit-notes">Notes</Label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
          />
        </div>

        {showRecurrence && (
          <div className="mt-4">
            <RecurrencePicker value={recurrence} onChange={setRecurrence} />
          </div>
        )}

        {recurring && !showRecurrence && (
          <p className="mt-4 text-xs text-tx-3">
            Repeats {describeRule(block.recurrenceRule).toLowerCase()}. To change
            how it repeats (or stop repeating), choose{" "}
            <button
              type="button"
              onClick={() => setScope("ALL")}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              All events
            </button>
            .
          </p>
        )}

        {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

        <div className="mt-5 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={busy}
            className="text-danger hover:text-danger"
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim()}>
              {saving || exSaving || splitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
