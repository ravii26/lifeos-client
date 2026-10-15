import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Stat } from "@/components/ui/Stat";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  useAdminAiCallsQuery,
  useAdminAiSummaryQuery,
  useAdminOverviewQuery,
  useAdminSavesQuery,
  type AiTotals,
} from "../adminApi";

/**
 * Admin: what the AI costs, where the tokens go, what fails, and whether
 * saves turn into anything. Only for emails in the server's ADMIN_EMAILS.
 */

const inr = (n: number) => `₹${n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString("en-IN")}`;
const num = (n: number) => n.toLocaleString("en-IN");
const tokens = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="card card-pad">
      <div className="card-head">
        <div className="card-title">{title}</div>
        {note && <div className="ml-auto text-xs text-tx-3">{note}</div>}
      </div>
      {children}
    </section>
  );
}

function Period({ label, t }: { label: string; t: AiTotals }) {
  const partial = t.unpricedCalls > 0 ? ` + ${t.unpricedCalls} unpriced` : "";
  return (
    <div className="flex flex-col gap-1">
      <Stat num={inr(t.costInr)} label={label} sub={`${num(t.calls)} calls${partial}`} />
      <div className="text-xs text-tx-3">
        {tokens(t.tokensIn)} in · {tokens(t.tokensOut)} out
        {t.failures > 0 && <span className="text-danger"> · {t.failures} failed</span>}
      </div>
    </div>
  );
}

function TotalsTable<T extends AiTotals>({ rows, name }: { rows: T[]; name: (r: T) => React.ReactNode }) {
  if (!rows.length) return <p className="text-sm text-tx-3">Nothing yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-tx-3">
            <th className="py-2 pr-3 font-semibold"></th>
            <th className="py-2 pr-3 text-right font-semibold">Cost</th>
            <th className="py-2 pr-3 text-right font-semibold">Calls</th>
            <th className="py-2 pr-3 text-right font-semibold">Tokens in</th>
            <th className="py-2 pr-3 text-right font-semibold">Tokens out</th>
            <th className="py-2 pr-3 text-right font-semibold">Failed</th>
            <th className="py-2 text-right font-semibold">Avg time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              <td className="py-2 pr-3">{name(r)}</td>
              <td className="py-2 pr-3 text-right font-mono">{r.unpricedCalls && !r.costInr ? "—" : inr(r.costInr)}</td>
              <td className="py-2 pr-3 text-right font-mono">{num(r.calls)}</td>
              <td className="py-2 pr-3 text-right font-mono">{tokens(r.tokensIn)}</td>
              <td className="py-2 pr-3 text-right font-mono">{tokens(r.tokensOut)}</td>
              <td className={`py-2 pr-3 text-right font-mono ${r.failures ? "text-danger" : ""}`}>{r.failures}</td>
              <td className="py-2 text-right font-mono">{(r.avgMs / 1000).toFixed(1)} s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Cost per day as plain bars; calls per day when nothing is priced yet.
function Days({ days }: { days: (AiTotals & { day: string })[] }) {
  if (!days.length) return <p className="text-sm text-tx-3">No AI calls in the last 30 days.</p>;
  const byCost = days.some((d) => d.costInr > 0);
  const value = (d: AiTotals) => (byCost ? d.costInr : d.calls);
  const max = Math.max(...days.map(value), 1);
  return (
    <div className="flex h-40 items-end gap-[3px]">
      {days.map((d) => (
        <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
          <div
            className="w-full bg-acc"
            style={{ height: `${Math.max(2, (value(d) / max) * 100)}%` }}
            title={`${d.day}: ${inr(d.costInr)}, ${d.calls} calls, ${tokens(d.tokensIn + d.tokensOut)} tokens`}
          />
        </div>
      ))}
    </div>
  );
}

const SUMMARY_LABEL: Record<string, string> = {
  READY: "summary ready",
  UNAVAILABLE: "couldn't read",
  PENDING: "reading…",
};

export function AdminPage() {
  const user = useAppSelector(selectCurrentUser);
  const [onlyFailures, setOnlyFailures] = useState(false);
  const overview = useAdminOverviewQuery(undefined, { skip: !user?.isAdmin });
  const summary = useAdminAiSummaryQuery(undefined, { skip: !user?.isAdmin });
  const calls = useAdminAiCallsQuery({ failures: onlyFailures, limit: 50 }, { skip: !user?.isAdmin });
  const saves = useAdminSavesQuery(undefined, { skip: !user?.isAdmin });

  if (user && !user.isAdmin) return <Navigate to="/" replace />;

  const s = summary.data;
  const o = overview.data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-wrap items-end gap-3">
        <h1 className="text-2xl font-black">Admin</h1>
        <p className="text-sm text-tx-3">AI cost, failures and saves. Days are in India time.</p>
      </header>

      {summary.isError && (
        <p className="text-sm text-danger">Couldn't load the AI numbers. Is ADMIN_EMAILS set on the server?</p>
      )}

      <Section title="AI cost" note={s ? `₹${s.usdInr} per $ · estimate from list prices` : undefined}>
        {s ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Period label="Today" t={s.today} />
            <Period label="Last 7 days" t={s.last7Days} />
            <Period label="Last 30 days" t={s.last30Days} />
          </div>
        ) : (
          <p className="text-sm text-tx-3">Loading…</p>
        )}
        {s && s.unpricedModels.length > 0 && (
          <p className="mt-4 text-xs text-tx-3">
            No price set for {s.unpricedModels.join(", ")}, so those calls aren't in the rupee total. Add them in{" "}
            <span className="font-mono">AI_PRICES_JSON</span> on the server.
          </p>
        )}
      </Section>

      <Section title="Per day" note="last 30 days">
        {s && <Days days={s.byDay} />}
      </Section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="By feature">{s && <TotalsTable rows={s.byFeature} name={(r) => r.feature} />}</Section>
        <Section title="By model">
          {s && (
            <TotalsTable
              rows={s.byModel}
              name={(r) => (
                <span>
                  {r.model} <span className="text-xs text-tx-3">{r.provider}</span>
                </span>
              )}
            />
          )}
        </Section>
      </div>

      <Section title="People" note={o ? `${o.users} users · ${o.newUsers} new this week · ${o.activeThisWeek} active this week` : undefined}>
        {s && <TotalsTable rows={s.byUser} name={(r) => r.email} />}
        {o && (
          <p className="mt-3 text-xs text-tx-3">
            {o.upcomingReminders} reminders scheduled · {o.savesThisWeek} saves this week
          </p>
        )}
      </Section>

      <Section title="Latest AI calls">
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyFailures} onChange={(e) => setOnlyFailures(e.target.checked)} />
          Only failures
        </label>
        {calls.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {calls.data.map((c) => (
                  <tr key={c.id} className="border-b border-line align-top last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 text-xs text-tx-3">{when(c.createdAt)}</td>
                    <td className="py-2 pr-3">{c.feature}</td>
                    <td className="py-2 pr-3 text-xs">{c.model}</td>
                    <td className="whitespace-nowrap py-2 pr-3 text-right font-mono text-xs">
                      {tokens(c.tokensIn)} / {tokens(c.tokensOut)}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 text-right font-mono text-xs">{(c.durationMs / 1000).toFixed(1)} s</td>
                    <td className="py-2 text-xs">
                      {c.ok ? <span className="text-ok">ok</span> : <span className="text-danger">{c.error ?? "failed"}</span>}
                      {c.email && <div className="text-tx-3">{c.email}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-tx-3">{calls.isLoading ? "Loading…" : "Nothing here."}</p>
        )}
      </Section>

      <Section title="Saves" note="did they turn into something?">
        {saves.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {saves.data.map((v) => {
                  const made = [
                    v.made.tasks && `${v.made.tasks} to-do${v.made.tasks > 1 ? "s" : ""}`,
                    v.made.habits && `${v.made.habits} habit${v.made.habits > 1 ? "s" : ""}`,
                    v.made.note && "note",
                    v.made.shelf && "kept for later",
                  ].filter(Boolean);
                  return (
                    <tr key={v.id} className="border-b border-line align-top last:border-0">
                      <td className="whitespace-nowrap py-2 pr-3 text-xs text-tx-3">{when(v.createdAt)}</td>
                      <td className="py-2 pr-3">
                        {v.url ? (
                          <a href={v.url} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-2">
                            {v.title}
                          </a>
                        ) : (
                          v.title
                        )}
                        <div className="text-xs text-tx-3">
                          {v.source}
                          {v.email && ` · ${v.email}`}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-xs">{v.summaryState ? (SUMMARY_LABEL[v.summaryState] ?? v.summaryState) : "no summary"}</td>
                      <td className="py-2 text-xs">
                        {v.status === "CONVERTED" ? made.join(", ") || "done" : v.status === "DISMISSED" ? "let go" : "waiting"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-tx-3">{saves.isLoading ? "Loading…" : "No saves yet."}</p>
        )}
      </Section>
    </div>
  );
}
