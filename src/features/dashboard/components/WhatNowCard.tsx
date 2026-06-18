import { useNavigate } from "react-router-dom";
import { Brain, Flame, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useGetDecisionsNowQuery, type DecisionSuggestion, type Urgency } from "@/features/decisions/decisionsApi";
import { useVibeConfig } from "@/features/settings/useVibe";

const TYPE_ROUTE: Record<string, string> = {
  TASK: "/tasks",
  HABIT: "/habits",
  AREA_FOCUS: "/areas",
  REVIEW: "/review",
  GOAL: "/goals",
};

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

  const suggestions = data.suggestions.slice(0, cfg.maxSuggestions);
  const hiddenCount = data.suggestions.length - suggestions.length;

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="size-4 text-primary" />
        <div className="text-sm font-semibold tracking-[-0.01em]">What Now?</div>
        {data.source === "ai" && (
          <span className="ml-auto chip text-[10px]">AI</span>
        )}
      </div>

      {/* Today focus */}
      <div className="mb-3 rounded-[var(--r-sm)] bg-acc-soft px-3 py-2.5">
        <div className="eyebrow mb-0.5">Today's focus</div>
        <div className="text-[13.5px] font-[550] text-tx">{data.todayFocus}</div>
      </div>

      {/* Suggestions */}
      <div className="-mx-3 flex flex-col divide-y divide-line">
        {suggestions.map((s) => (
          <SuggestionRow key={s.rank} s={s} showUrgency={cfg.showUrgency} energetic={cfg.emphasize} />
        ))}
      </div>

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
