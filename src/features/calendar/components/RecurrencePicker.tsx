import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  type Freq,
  type IcalDay,
  type RecurrenceState,
  WEEKDAY_ORDER,
  icalDayLabel,
} from "../recurrence";

const FREQ_OPTIONS: { value: Freq; label: string }[] = [
  { value: "NONE", label: "Does not repeat" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export function RecurrencePicker({
  value,
  onChange,
}: {
  value: RecurrenceState;
  onChange: (next: RecurrenceState) => void;
}) {
  const toggleDay = (d: IcalDay) => {
    const has = value.byDay.includes(d);
    onChange({
      ...value,
      byDay: has
        ? value.byDay.filter((x) => x !== d)
        : [...value.byDay, d],
    });
  };

  return (
    <div className="space-y-2">
      <Label>Repeat</Label>
      <Select
        value={value.freq}
        onValueChange={(freq) =>
          onChange({ freq: freq as Freq, byDay: freq === "WEEKLY" ? value.byDay : [] })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FREQ_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.freq === "WEEKLY" && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {WEEKDAY_ORDER.map((d) => {
            const active = value.byDay.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                aria-pressed={active}
                className={cn(
                  "h-8 w-10 rounded-md border text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-line text-tx-3 hover:bg-surface-2",
                )}
              >
                {icalDayLabel(d)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
