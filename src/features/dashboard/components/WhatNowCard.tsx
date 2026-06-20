import { useNavigate } from "react-router-dom";
import { Brain, Flame, TrendingDown, Play, PartyPopper } from "lucide-react";

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
};

// tone → hero theming. Unknown values fall back to "neutral" for forward-safety.
const TONE_THEME: Record<Tone, { accent: string; soft: string; emoji: string }> = {
  encouraging: { accent: "#5b8cff", soft: "rgba(91,140,255,0.10)", emoji: "💪" },
  firm: { accent: "#f5c842", soft: "rgba(245,200,66,0.10)", emoji: "⚠️" },
  celebratory: { accent: "#2dd4a7", soft: "rgba(45,212,167,0.10)", emoji: "🎉" },
  neutral: { accent: "var(--accent, #8a8f98)", soft: "var(--acc-soft)", emoji: "🧭" },
};

const toneTheme = (tone: Tone) => TONE_THEME[tone] ?? TONE_THEME.neutral;

const URGENCY_STYLE: Record<Urgency, string> = {
  HIGH: "bg-[rgba(255,107,129,0.15)] text-[#ff6b81]",
  MEDIUM: "bg-[rgba(245,200,66,0.15)] text-[#f5c842]",
  LOW: "bg-[rgba(45,212,167,0.10)] text-[#2dd4a7]",
};

const URGENCY_STYLE_ENERGETIC: Record<Urgency, string> = {
  HIGH: "bg-[rgba(255,107,129,0.25)] text-[#ff6b81] font-bold ring-1 ring-[rgba(255,107,129,0.4)]",
  MEDIUM: "bg-[rgba(245,200,66,0.22)] text-[#f5c842] font-bold",
  LOW: "bg-[rgba(45,212,167,0.15)] text-[#2dd4a7]",
};

function HeroCTA({ action, accent, soft }: { action: PrimaryAction; accent: string; soft: string }) {
  const navigate = useNavigate();
  // REVIEW has a null refId (open composer); other types deep-link to their section.
  const go = () => navigate(TYPE_ROUTE[action.type] ?? "/");

  return (
    <button
      type="button"
      onClick={go}
      className="mt-3 flex w-full items-center gap-3 rounded-[var(--r-sm)] px-3 py-3 text-left transition-colors hover:brightness-110"
      style={{ background: soft, border: `1px solid ${accent}` }}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: accent }}
      >
        <Play className="size-4 fill-white text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-[600] text-tx">{action.title}</span>
          {action.estimatedMinutes != null && (
            <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-tx-3">
              ~{action.estimatedMinutes}m
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12px] text-tx-3 leading-relaxed">{action.why}</div>
      </div>
    </button>
  );
}

function SuggestionRow({ s, showUrgency, energetic }: { s: DecisionSuggestion; showUrgency: boolean; energetic: boolean }) {
  const navigate = useNavigate();
  const clickable = s.refId !== null;

  const handleClick = () => {
    if (!clickable) return;
    navigate(TYPE_ROUTE[s.type] ?? "/");
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-[var(--r-sm)] px-3 py-2.5 transition-colors",
        clickable ? "cursor-pointer hover:bg-surface-2" : "cursor-default",
        energetic && s.urgency === "HIGH" && "bg-[rgba(255,107,129,0.04)]",
      )}
    >
      <span className="mt-0.5 font-mono text-[11px] font-semibold text-tx-4 w-4 shrink-0">
        {s.rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-[550] text-tx leading-snug">{s.title}</div>
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
            "shrink-0 mt-0.5 rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase",
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

  if (isLoading || isError || !data) return null;

  const theme = toneTheme(data.tone);
  // suggestions[0] is mirrored by the hero CTA; the list is "if you want more".
  const upNext = data.suggestions.slice(1, 1 + cfg.maxSuggestions);
  const hiddenCount = Math.max(0, data.suggestions.length - 1 - upNext.length);
  const caughtUp = data.primaryAction === null;

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="size-4 text-primary" />
        <div className="text-sm font-semibold tracking-[-0.01em]">What Now?</div>
        {data.source === "ai" && <span className="ml-auto chip text-[10px]">AI</span>}
      </div>

      {/* Hero — coach voice */}
      <div
        className="rounded-[var(--r-sm)] px-3 py-3"
        style={{ background: theme.soft, borderLeft: `3px solid ${theme.accent}` }}
      >
        <div className="flex items-start gap-2">
          <span className="text-[15px] leading-none">{caughtUp ? "🎉" : theme.emoji}</span>
          <div className="min-w-0">
            <div className="text-[14.5px] font-[650] leading-snug text-tx">{data.headline}</div>
            <div className="mt-1 text-[12.5px] text-tx-3 leading-relaxed">{data.briefing}</div>
          </div>
        </div>

        {data.primaryAction ? (
          <HeroCTA action={data.primaryAction} accent={theme.accent} soft="var(--surface-2,rgba(255,255,255,0.03))" />
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-[var(--r-sm)] bg-surface-2 px-3 py-2.5 text-[12.5px] text-tx-3">
            <PartyPopper className="size-4 shrink-0 text-[#2dd4a7]" />
            You&rsquo;re all caught up — nothing pending right now.
          </div>
        )}
      </div>

      {/* Up next — the ranked list, de-emphasized */}
      {upNext.length > 0 && (
        <>
          <div className="eyebrow mb-1 mt-4">Up next</div>
          <div className="-mx-3 flex flex-col divide-y divide-line">
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
        <div
          className="mt-3 flex items-start gap-2.5 rounded-[var(--r-sm)] px-3 py-2.5"
          style={{ background: "rgba(255,107,129,0.08)", border: "1px solid rgba(255,107,129,0.2)" }}
        >
          <TrendingDown className="mt-0.5 size-3.5 shrink-0 text-[#ff6b81]" />
          <div>
            <div className="text-[12.5px] font-[600] text-[#ff6b81]">
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
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]",
                cfg.emphasize
                  ? "bg-[rgba(245,200,66,0.2)] text-[#f5c842] font-semibold ring-1 ring-[rgba(245,200,66,0.3)]"
                  : "bg-[rgba(245,200,66,0.12)] text-[#f5c842]",
              )}
            >
              <Flame className={cn("size-3 shrink-0", cfg.emphasize && "size-3.5")} />
              <span className="font-semibold">{alert.streakDays}d</span>
              <span className="text-tx-3">{alert.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Behavior insight + weekly pattern */}
      <div className="mt-3 border-t border-line pt-2.5 space-y-1 font-mono text-[11px] text-tx-4 italic">
        <div>{data.behaviorInsight}</div>
        {data.weeklyPattern && <div>{data.weeklyPattern}</div>}
      </div>
    </div>
  );
}
