import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import type { Area } from "@/features/areas/types";

import { useCreateHabitMutation } from "../habitsApi";
import { DAYS, FREQUENCIES, HABIT_TYPES } from "../constants";
import type { Day, HabitFrequency, HabitType } from "../types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

export function NewHabitForm({
  areas,
  onClose,
}: {
  areas: Area[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState(areas[0]?.id ?? "");
  const [habitType, setHabitType] = useState<HabitType>("BOOLEAN");
  const [targetCount, setTargetCount] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("DAILY");
  const [weeklyTarget, setWeeklyTarget] = useState("");
  const [specificDays, setSpecificDays] = useState<Day[]>([]);
  const [reminderTime, setReminderTime] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createHabit, { isLoading }] = useCreateHabitMutation();

  const toggleDay = (day: Day) =>
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !areaId) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createHabit({
        title: title.trim(),
        areaId,
        habitType,
        frequency,
        ...(description.trim() ? { description: description.trim() } : {}),
        // Type-conditional targets.
        ...(habitType === "COUNT" && targetCount
          ? { targetCount: Number(targetCount) }
          : {}),
        ...(habitType === "TIMER" && targetMinutes
          ? { targetMinutes: Number(targetMinutes) }
          : {}),
        // Frequency-conditional fields.
        ...(frequency === "WEEKLY" && weeklyTarget
          ? { weeklyTarget: Number(weeklyTarget) }
          : {}),
        ...(frequency === "CUSTOM" ? { specificDays } : {}),
        ...(reminderTime ? { reminderTime } : {}),
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
        <Label htmlFor="habit-title">Title</Label>
        <Input
          id="habit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read 20 minutes"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="habit-desc">Description</Label>
        <textarea
          id="habit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — why this habit matters…"
          rows={2}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="habit-area">Area</Label>
          <select
            id="habit-area"
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
          <Label htmlFor="habit-reminder">Reminder time</Label>
          <Input
            id="habit-reminder"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="[color-scheme:dark]"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="habit-type">Type</Label>
          <select
            id="habit-type"
            value={habitType}
            onChange={(e) => setHabitType(e.target.value as HabitType)}
            className={selectClass}
          >
            {HABIT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} — {t.hint}
              </option>
            ))}
          </select>
        </div>

        {habitType === "COUNT" && (
          <div className="space-y-2">
            <Label htmlFor="habit-target-count">Target count</Label>
            <Input
              id="habit-target-count"
              type="number"
              min={1}
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
        )}

        {habitType === "TIMER" && (
          <div className="space-y-2">
            <Label htmlFor="habit-target-minutes">Target minutes</Label>
            <Input
              id="habit-target-minutes"
              type="number"
              min={1}
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(e.target.value)}
              placeholder="e.g. 20"
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="habit-frequency">Frequency</Label>
          <select
            id="habit-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            className={selectClass}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label} — {f.hint}
              </option>
            ))}
          </select>
        </div>

        {frequency === "WEEKLY" && (
          <div className="space-y-2">
            <Label htmlFor="habit-weekly-target">Times per week</Label>
            <Input
              id="habit-weekly-target"
              type="number"
              min={1}
              max={7}
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
        )}
      </div>

      {frequency === "CUSTOM" && (
        <div className="mt-4 space-y-2">
          <Label>Days</Label>
          <div className="flex gap-1.5">
            {DAYS.map((d) => {
              const on = specificDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={cn(
                    "size-9 rounded-md border text-sm font-medium transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-line-2 text-tx-3 hover:border-primary/60",
                  )}
                  title={d.value}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          {fieldErrors.specificDays && (
            <p className="text-xs text-danger">{fieldErrors.specificDays}</p>
          )}
        </div>
      )}

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading || !title.trim() || !areaId}>
          {isLoading ? "Adding…" : "Add habit"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
