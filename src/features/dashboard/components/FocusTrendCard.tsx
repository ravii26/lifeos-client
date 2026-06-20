import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useDailyFocusQuery } from "@/features/focus/focusApi";

// The /focus/daily endpoint keys buckets by UTC day and omits zero-focus days.
// To draw a continuous 7-bar strip we generate the last 7 UTC day-keys and
// fill gaps with 0.
const utcKey = (d: Date) => d.toISOString().slice(0, 10);

function lastSevenUtcDays(): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    out.push(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)),
    );
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
    return lastSevenUtcDays().map((d) => ({
      key: utcKey(d),
      label: d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }),
      minutes: byDate.get(utcKey(d)) ?? 0,
    }));
  }, [data]);

  if (isLoading || isError || !data) return null;

  const total = days.reduce((sum, d) => sum + d.minutes, 0);
  const max = Math.max(1, ...days.map((d) => d.minutes));
  const todayKey = utcKey(new Date());

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
