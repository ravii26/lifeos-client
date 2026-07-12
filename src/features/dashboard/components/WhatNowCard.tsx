import { useNavigate } from "react-router-dom";
import { Brain, CalendarClock, Flame, TrendingDown, Play, PartyPopper } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  useGetDecisionsNowQuery,
  type DecisionSuggestion,
  type PrimaryAction,
  type Tone,
  type Urgency,
} from "@/features/decisions/decisionsApi";
import { useVibeConfig } from "@/features/settings/useVibe";

const TYPE_ROUTE: Record<string, string> = {
  TASK: "/tasks",
  HABIT: "/habits",
  AREA_FOCUS: "/areas",
  REVIEW: "/review",
  GOAL: "/goals",
  // New coach suggestion types — deep-link to the closest surface.
  PROJECT: "/areas", // projects live within areas on web
  CAPTURE: "/dump",
  RESOURCE: "/learn",
  NOTE: "/learn",
  VAULT: "/vault",
};

// tone → hero accent. A colored dot + border-flag mark tone instead of an
// emoji or a soft tinted wash — flat panel, solid accent stripe.
const TONE_ACCENT: Record<Tone, string> = {
  encouraging: "var(--career)",
  firm: "var(--warn)",
  celebratory: "var(--ok)",
  neutral: "var(--acc)",
};

const toneAccent = (tone: Tone) => TONE_ACCENT[tone] ?? TONE_ACCENT.neutral;

const URGENCY_STYLE: Record<Urgency, string> = {
  HIGH: "border-2 border-danger text-danger",
  MEDIUM: "border-2 border-warn text-warn",
  LOW: "border-2 border-ok text-ok",
};

const URGENCY_STYLE_ENERGETIC: Record<Urgency, string> = {
  HIGH: "bg-danger text-white font-bold border-2 border-tx",
  MEDIUM: "bg-warn text-tx font-bold border-2 border-tx",
  LOW: "border-2 border-ok text-ok",
};

function HeroCTA({ action, accent }: { action: PrimaryAction; accent: string }) {
  const navigate = useNavigate();
  // REVIEW has a null refId (open composer); other types deep-link to their section.
  const go = () => navigate(TYPE_ROUTE[action.type] ?? "/");

  return (
    <button
      type="button"
      onClick={go}
      className="mt-3 flex w-full items-center gap-3 border-2 border-tx bg-surface-2 px-3 py-3 text-left transition-colors hover:bg-surface-3"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center border-[1.5px] border-tx"
        style={{ background: accent }}
      >
        <Play className="size-4 fill-white text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-[650] text-tx">{action.title}</span>
          {action.estimatedMinutes != null && (
            <span className="chip shrink-0 text-[10px]">~{action.estimatedMinutes}m</span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-tx-3 leading-relaxed">{action.why}</div>
      </div>
    </button>
  );
}

function SuggestionRow({ s, showUrgency, energetic }: { s: DecisionSuggestion; showUrgency: boolean; energetic: boolean }) {
  const navigate = useNavigate();
  // Navigable whenever the type maps to a surface — some types (CAPTURE,
  // REVIEW) have a null refId but still deep-link to their inbox/screen.
  const clickable = TYPE_ROUTE[s.type] != null;

  const handleClick = () => {
    if (!clickable) return;
    navigate(TYPE_ROUTE[s.type] ?? "/");
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 px-3 py-2.5 transition-colors",
        clickable ? "cursor-pointer hover:bg-surface-2" : "cursor-default",
      )}
      style={energetic && s.urgency === "HIGH" ? { borderLeft: "3px solid var(--danger)" } : undefined}
    >
      <span className="mt-0.5 font-mono text-[11px] font-bold text-tx-4 w-4 shrink-0">
        {s.rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-[600] text-tx leading-snug">{s.title}</div>
        <div className="mt-0.5 text-[12px] text-tx-3 leading-relaxed">{s.reason}</div>
        {s.actionableSteps && s.actionableSteps.length > 0 && (
          <ol className="mt-1.5 space-y-0.5 pl-0 list-none">
            {s.actionableSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-tx-4">
                <span className="shrink-0 font-mono text-[10px] mt-[1px]">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>
      {showUrgency && (
        <span
          className={cn(
            "shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
            energetic ? URGENCY_STYLE_ENERGETIC[s.urgency] : URGENCY_STYLE[s.urgency],
          )}
        >
          {s.urgency}
        </span>
      )}
    </div>
  );
}

export function WhatNowCard() {
  const { data, isError, isLoading } = useGetDecisionsNowQuery();
  const cfg = useVibeConfig();

  if (isLoading) {
    return (
      <div className="card card-pad">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="size-4 text-acc" />
          <div className="font-display text-[15px] font-bold">What Now?</div>
        </div>
        <p className="text-[12.5px] text-tx-3">Loading your next move…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card card-pad">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="size-4 text-acc" />
          <div className="font-display text-[15px] font-bold">What Now?</div>
        </div>
        <p className="text-[12.5px] text-danger">
          Couldn't load suggestions. Is the backend running?
        </p>
      </div>
    );
  }

  const accent = toneAccent(data.tone);
  // suggestions[0] is mirrored by the hero CTA; the list is "if you want more".
  const upNext = data.suggestions.slice(1, 1 + cfg.maxSuggestions);
  const hiddenCount = Math.max(0, data.suggestions.length - 1 - upNext.length);
  const caughtUp = data.primaryAction === null;

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="size-4 text-acc" />
        <div className="font-display text-[15px] font-bold">What Now?</div>
        {data.source === "ai" && <span className="ml-auto chip text-[10px]">AI</span>}
      </div>

      {/* Schedule strip — what you're time-blocked into now (or next), so the
          "right thing" is anchored to the clock. */}
      {data.schedule && (data.schedule.current || data.schedule.next) && (
        <div className="mb-3 flex items-center gap-2 border-2 border-tx bg-surface-1 px-3 py-1.5 text-[12px]">
          <CalendarClock className="size-3.5 shrink-0 text-acc" />
          {data.schedule.current ? (
            <span className="min-w-0 truncate text-tx">
              <span className="font-mono text-[10px] font-bold uppercase text-acc">Now</span>{" "}
              <span className="font-[600]">{data.schedule.current.title}</span>
              <span className="text-tx-4"> · until {data.schedule.current.endsAt}</span>
            </span>
          ) : (
            <span className="min-w-0 truncate text-tx">
              <span className="font-mono text-[10px] font-bold uppercase text-tx-4">Next</span>{" "}
              <span className="font-[600]">{data.schedule!.next!.title}</span>
              <span className="text-tx-4"> · {data.schedule!.next!.startsAt}</span>
            </span>
          )}
        </div>
      )}

      {/* Hero — coach voice. Flat surface, bold accent flag on the left. */}
      <div
        className="border-2 border-tx bg-surface-2 px-3 py-3"
        style={{ borderLeft: `5px solid ${caughtUp ? "var(--ok)" : accent}` }}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-[7px] size-1.5 shrink-0 rounded-full"
            style={{ background: caughtUp ? "var(--ok)" : accent }}
          />
          <div className="min-w-0">
            <div className="text-[14.5px] font-[700] leading-snug text-tx">{data.headline}</div>
            <div className="mt-1 text-[12.5px] text-tx-3 leading-relaxed">{data.briefing}</div>
          </div>
        </div>

        {data.primaryAction ? (
          <HeroCTA action={data.primaryAction} accent={accent} />
        ) : (
          <div className="mt-3 flex items-center gap-2 border-2 border-tx bg-surface-1 px-3 py-2.5 text-[12.5px] text-tx-3">
            <PartyPopper className="size-4 shrink-0 text-ok" />
            You&rsquo;re all caught up — nothing pending right now.
          </div>
        )}
      </div>

      {/* Up next — the ranked list, de-emphasized */}
      {upNext.length > 0 && (
        <>
          <div className="eyebrow mb-1 mt-4">Up next</div>
          <div className="-mx-3 flex flex-col divide-y-2 divide-line">
            {upNext.map((s) => (
              <SuggestionRow key={s.rank} s={s} showUrgency={cfg.showUrgency} energetic={cfg.emphasize} />
            ))}
          </div>
        </>
      )}

      {hiddenCount > 0 && (
        <div className="mt-1 px-3 text-[11px] text-tx-4">
          + {hiddenCount} more held back. Switch vibe to see everything.
        </div>
      )}

      {/* Neglected area — hidden on calm (no guilt) */}
      {cfg.showAlerts && data.neglectedArea && (
        <div className="mt-3 flex items-start gap-2.5 border-2 border-danger bg-surface-1 px-3 py-2.5">
          <TrendingDown className="mt-0.5 size-3.5 shrink-0 text-danger" />
          <div>
            <div className="text-[12.5px] font-[700] text-danger">
              {data.neglectedArea.name}{" "}
              <span className="font-mono font-normal">{data.neglectedArea.score}</span>
            </div>
            <div className="text-[12px] text-tx-3">{data.neglectedArea.insight}</div>
          </div>
        </div>
      )}

      {/* Streak alerts — hidden on calm (no pressure), emphasized on energetic */}
      {cfg.showStreaks && data.streakAlerts && data.streakAlerts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.streakAlerts.map((alert) => (
            <div
              key={alert.habitId}
              className={cn(
                "flex items-center gap-1.5 border-2 px-2.5 py-1 text-[11px]",
                cfg.emphasize
                  ? "border-tx bg-warn text-tx font-bold"
                  : "border-warn text-warn",
              )}
            >
              <Flame className={cn("size-3 shrink-0", cfg.emphasize && "size-3.5")} />
              <span className="font-bold">{alert.streakDays}d</span>
              <span className={cfg.emphasize ? "text-tx" : "text-tx-3"}>{alert.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Behavior insight + weekly pattern */}
      <div className="mt-3 border-t-2 border-tx pt-2.5 space-y-1 font-mono text-[11px] text-tx-4">
        <div>{data.behaviorInsight}</div>
        {data.weeklyPattern && <div>{data.weeklyPattern}</div>}
      </div>
    </div>
  );
}
