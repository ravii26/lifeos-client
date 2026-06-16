import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Timer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useListAreasQuery } from "@/features/areas/areasApi";
import { useListFocusQuery } from "@/features/focus/focusApi";

import { useDeleteCalendarMutation, useListCalendarQuery } from "../calendarApi";
import { NewBlockForm } from "../components/NewBlockForm";

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function dayBounds(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
}
function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarPage() {
  const [day, setDay] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const { from, to } = dayBounds(day);

  const { data: areas } = useListAreasQuery();
  const {
    data: blocks,
    isLoading,
    isError,
  } = useListCalendarQuery({ from, to });
  const { data: focusSessions } = useListFocusQuery({ from, to });
  const [deleteBlock] = useDeleteCalendarMutation();

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const sorted = [...(blocks ?? [])].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );
  const isToday = dayKey(day) === dayKey(new Date());

  const shift = (n: number) => {
    const d = new Date(day);
    d.setDate(d.getDate() + n);
    setDay(d);
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Execution · time
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-tx-3">
            Plan your blocks and track focused time.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New block
        </Button>
      </div>

      {/* Day navigator */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="grid size-8 place-items-center rounded-md border border-line-2 text-tx-3 hover:text-tx"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="min-w-[200px] text-center text-sm font-medium">
          {day.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          className="grid size-8 place-items-center rounded-md border border-line-2 text-tx-3 hover:text-tx"
        >
          <ChevronRight className="size-4" />
        </button>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setDay(new Date())}>
            Today
          </Button>
        )}
      </div>

      {showForm && (
        <NewBlockForm
          date={dayKey(day)}
          areas={areas ?? []}
          onClose={() => setShowForm(false)}
        />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your calendar. Is the backend running?
        </p>
      )}

      {/* Time blocks */}
      {blocks && sorted.length === 0 && !showForm && (
        <div className="mt-8 rounded-xl border border-dashed border-line-2 p-10 text-center text-sm text-tx-3">
          Nothing scheduled for this day.
        </div>
      )}

      {sorted.length > 0 && (
        <div className="mt-6 space-y-2">
          {sorted.map((b) => {
            const area = b.areaId ? areaById.get(b.areaId) : undefined;
            return (
              <div
                key={b.id}
                className="flex items-center gap-4 rounded-lg border border-line bg-surface-2 px-4 py-3"
              >
                <div className="w-24 shrink-0 font-mono text-xs text-tx-3">
                  {time(b.startTime)}
                  <span className="text-tx-4"> – {time(b.endTime)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-tx-3">
                    {b.blockType && (
                      <span className="font-mono uppercase tracking-wide">
                        {b.blockType}
                      </span>
                    )}
                    {area && (
                      <span className="flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        {area.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteBlock(b.id)}
                  title="Delete block"
                  className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Focus sessions for the day */}
      {focusSessions && focusSessions.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            <Timer className="size-3.5" /> Focus sessions · {focusSessions.length}
          </div>
          <div className="space-y-2">
            {focusSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-1 px-4 py-2.5 text-sm"
              >
                <span className="font-mono text-xs text-tx-3">
                  {time(s.startedAt)}
                  {s.endedAt && (
                    <span className="text-tx-4"> – {time(s.endedAt)}</span>
                  )}
                </span>
                <span className="text-tx-2">
                  {s.durationMinutes != null ? (
                    `${s.durationMinutes} min`
                  ) : (
                    <span className="text-primary">running…</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
