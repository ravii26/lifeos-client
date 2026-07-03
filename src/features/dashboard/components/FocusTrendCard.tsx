import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { localDayKey } from "@/lib/date";
import { useDailyFocusQuery } from "@/features/focus/focusApi";

// The /focus/daily endpoint keys buckets by the user's local day and omits
// zero-focus days. To draw a continuous 7-bar strip we generate the last 7
// local day-keys and fill gaps with 0.
const localKey = localDayKey;

function lastSevenLocalDays(): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    out.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
  }
  return out;
}

const fmtHm = (mins: number) => {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

export function FocusTrendCard() {
  // Default window (server picks last 7 days) is exactly what we render.
  const { data, isLoading, isError } = useDailyFocusQuery();

  const days = useMemo(() => {
    const byDate = new Map((data ?? []).map((d) => [d.date, d.minutes]));
    return lastSevenLocalDays().map((d) => ({
      key: localKey(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      minutes: byDate.get(localKey(d)) ?? 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="card card-pad">
        <div className="eyebrow mb-1.5">Last 7 days</div>
        <p className="text-[12.5px] text-tx-3">Loading focus history…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card card-pad">
        <div className="eyebrow mb-1.5">Last 7 days</div>
        <p className="text-[12.5px] text-danger">
          Couldn't load focus history. Is the backend running?
        </p>
      </div>
    );
  }

  const total = days.reduce((sum, d) => sum + d.minutes, 0);
  const max = Math.max(1, ...days.map((d) => d.minutes));
  const todayKey = localKey(new Date());

  return (
    <div className="card card-pad">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="eyebrow">Last 7 days</div>
        <span
          className="chip border-transparent"
          style={{ color: "var(--acc)", background: "var(--acc-soft)" }}
        >
          Focus
        </span>
      </div>

      <div className="my-1.5 font-mono text-[30px] font-semibold leading-none">
        {fmtHm(total)}
        <span className="text-sm text-tx-3"> this week</span>
      </div>

      {total === 0 ? (
        <p className="mt-2 text-[12.5px] text-tx-4">
          No focus logged this week. Start a session to build the streak.
        </p>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 88 }}>
          {days.map((d) => {
            const isToday = d.key === todayKey;
            const pct = (d.minutes / max) * 100;
            return (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    title={`${d.minutes} min`}
                    className={cn(
                      "w-full max-w-[26px] rounded-[3px] transition-[height]",
                      d.minutes === 0 && "opacity-40",
                    )}
                    style={{
                      height: `${Math.max(pct, d.minutes > 0 ? 6 : 2)}%`,
                      background: isToday ? "var(--acc)" : "var(--acc-soft)",
                      border: isToday ? "none" : "1px solid var(--acc-line)",
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    isToday ? "font-semibold text-tx" : "text-tx-4",
                  )}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
