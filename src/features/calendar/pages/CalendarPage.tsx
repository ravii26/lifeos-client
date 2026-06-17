import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Plus, Trash2 } from "lucide-react";

import { Stat } from "@/components/ui/Stat";
import { useListAreasQuery } from "@/features/areas/areasApi";
import { useActiveFocus } from "@/features/focus/useActiveFocus";
import { useListFocusQuery } from "@/features/focus/focusApi";

import { useDeleteCalendarMutation, useListCalendarQuery } from "../calendarApi";
import { NewBlockForm } from "../components/NewBlockForm";

const HPX = 56; // pixels per hour row

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
function hourFrac(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}
function hourLabel(h: number): string {
  if (h === 0 || h === 24) return "12am";
  if (h === 12) return "12pm";
  return h > 12 ? `${h - 12}pm` : `${h}am`;
}
function clock(iso: string): string {
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
  const { data: blocks } = useListCalendarQuery({ from, to });
  const { data: focusSessions } = useListFocusQuery({ from, to });
  const [deleteBlock] = useDeleteCalendarMutation();
  const focus = useActiveFocus();

  const areaById = useMemo(
    () => new Map((areas ?? []).map((a) => [a.id, a])),
    [areas],
  );
  const dayBlocks = useMemo(() => blocks ?? [], [blocks]);

  // Hour window: fit all blocks, default 8am–8pm.
  const [minHour, maxHour] = useMemo(() => {
    let lo = 0;
    let hi = 25;
    for (const b of dayBlocks) {
      lo = Math.min(lo, Math.floor(hourFrac(b.startTime)));
      hi = Math.max(hi, Math.ceil(hourFrac(b.endTime)));
    }
    return [lo, hi];
  }, [dayBlocks]);
  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);

  const isToday = dayKey(day) === dayKey(new Date());
  const shift = (n: number) => {
    const d = new Date(day);
    d.setDate(d.getDate() + n);
    setDay(d);
  };

  const plannedMins = dayBlocks.reduce(
    (s, b) => s + (hourFrac(b.endTime) - hourFrac(b.startTime)) * 60,
    0,
  );
  const trackedMins = (focusSessions ?? []).reduce(
    (s, f) => s + (f.durationMinutes ?? 0),
    0,
  );

  // Planned minutes per area for the day summary.
  const areaMins = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of dayBlocks) {
      if (!b.areaId) continue;
      const mins = (hourFrac(b.endTime) - hourFrac(b.startTime)) * 60;
      m.set(b.areaId, (m.get(b.areaId) ?? 0) + mins);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [dayBlocks]);

  const stats = [
    { num: dayBlocks.length, label: "Planned blocks" },
    {
      num: `${Math.round(plannedMins / 60)}h`,
      label: "Planned time",
      color: "var(--tx)",
    },
    {
      num: `${trackedMins}m`,
      label: "Tracked focus",
      color: "var(--ok)",
    },
    {
      num: focus.active ? focus.label : "—",
      label: focus.active ? "Live session" : "Idle",
      color: focus.active ? "var(--acc)" : "var(--tx-3)",
    },
  ];

  return (
    <div className="page rise">
      <div className="mb-[var(--gap)] flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Execution · time</div>
          <h1 className="page-title">Calendar</h1>
          <div className="page-sub">
            {day.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}{" "}
            · planned vs. actual focus
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="icon-btn"
            title="Previous day"
          >
            <ChevronLeft className="size-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setDay(new Date())}
              className="ds-btn ghost sm"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => shift(1)}
            className="icon-btn"
            title="Next day"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
        {stats.map((x) => (
          <div key={x.label} className="card card-pad">
            <Stat num={x.num} label={x.label} color={x.color} />
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewBlockForm
            date={dayKey(day)}
            areas={areas ?? []}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="grid gap-[var(--gap)] lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Timeline */}
        <div className="card card-pad">
          <div className="eyebrow mb-3.5">Timeline · Today</div>
          <div className="relative">
            {hours.map((h) => (
              <div
                key={h}
                className="flex items-start border-t border-line"
                style={{ minHeight: HPX }}
              >
                <div className="w-[50px] shrink-0 pt-1 font-mono text-[11px] text-tx-4">
                  {hourLabel(h)}
                </div>
                <div className="relative flex-1" style={{ minHeight: HPX }}>
                  {dayBlocks
                    .filter((b) => Math.floor(hourFrac(b.startTime)) === h)
                    .map((b) => {
                      const area = b.areaId
                        ? areaById.get(b.areaId)
                        : undefined;
                      const color = area?.color ?? "var(--acc)";
                      const sf = hourFrac(b.startTime);
                      const ef = hourFrac(b.endTime);
                      return (
                        <div
                          key={b.id}
                          className="group absolute right-2 left-0 rounded-lg px-2.5 py-1.5"
                          style={{
                            top: (sf - h) * HPX + 3,
                            height: Math.max(20, (ef - sf) * HPX - 6),
                            background: `${color}1a`,
                            borderLeft: `2.5px solid ${color}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="truncate text-[13px] font-semibold"
                              style={{ color }}
                            >
                              {b.title}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteBlock(b.id)}
                              className="shrink-0 text-tx-4 opacity-0 transition hover:text-danger group-hover:opacity-100"
                              title="Delete block"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                          <div className="font-mono text-[10px] text-tx-3">
                            {clock(b.startTime)}–{clock(b.endTime)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {dayBlocks.length === 0 && (
              <div className="empty">Nothing scheduled — add a time block.</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-[var(--gap)]">
          <div className="card card-pad">
            <div className="eyebrow mb-3">Day summary</div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-tx-2">Planned focus</span>
                <span className="font-mono text-[13px]">
                  {Math.round(plannedMins)}m
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-tx-2">Tracked focus</span>
                <span className="font-mono text-[13px] text-primary">
                  {trackedMins}m
                </span>
              </div>
              {areaMins.length > 0 && (
                <>
                  <hr className="my-1 border-line" />
                  {areaMins.map(([id, mins]) => {
                    const a = areaById.get(id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5 text-[13px] text-tx-2">
                          <span
                            className="size-[7px] rounded-full"
                            style={{ background: a?.color ?? "var(--tx-3)" }}
                          />
                          {a?.name ?? "—"}
                        </span>
                        <span className="font-mono text-[11px] text-tx-3">
                          {Math.round(mins)}m
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          <div className="card card-pad">
            <div className="eyebrow mb-3">Quick focus</div>
            {focus.active ? (
              <button
                type="button"
                onClick={focus.stop}
                className="ds-btn w-full"
              >
                <Pause className="size-3.5" /> Stop &amp; log {focus.label}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => focus.start()}
                className="ds-btn acc w-full"
              >
                <Play className="size-3.5" /> Start focus session
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="ds-btn ghost mt-2 w-full"
            >
              <Plus className="size-3.5" /> Add time block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
