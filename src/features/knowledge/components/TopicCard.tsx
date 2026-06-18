import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";

import { MASTERY_BY_VALUE, MASTERY_LEVELS } from "../constants";
import type { Topic } from "../types";

const MASTERY_ORDER: Record<string, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
  EXPERT: 3,
};

export function TopicCard({ topic, area }: { topic: Topic; area?: Area }) {
  const mastery = topic.masteryLevel
    ? MASTERY_BY_VALUE[topic.masteryLevel]
    : MASTERY_BY_VALUE.BEGINNER;

  const masteryStep = MASTERY_ORDER[mastery.value] ?? 0;
  const areaColor = area?.color ?? "var(--line-2)";

  return (
    <Link
      to={`/learn/${topic.id}`}
      className="group relative flex flex-col overflow-hidden rounded-[var(--r-md)] border border-line bg-surface-1 transition-all hover:border-line-2 hover:shadow-lg"
    >
      {/* Colored top bar */}
      <div className="h-[3px] w-full" style={{ background: areaColor }} />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-3 pt-3.5">
        {/* Area + mastery row */}
        <div className="flex items-center justify-between gap-2">
          {area ? (
            <span
              className="chip border-transparent text-[10px]"
              style={{ color: areaColor, background: `color-mix(in srgb, ${areaColor} 15%, transparent)` }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: areaColor }} />
              {area.name}
            </span>
          ) : (
            <span />
          )}
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", mastery.tone, mastery.bg)}>
            {mastery.label}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <div className="text-[14.5px] font-semibold leading-snug">{topic.title}</div>
          {topic.description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-tx-3">
              {topic.description}
            </p>
          )}
        </div>

        {/* Mastery progress dots */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {MASTERY_LEVELS.map((m, i) => (
              <div
                key={m.value}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i <= masteryStep ? mastery.dot : "bg-surface-3",
                )}
              />
            ))}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-tx-4 transition-colors group-hover:text-tx-2">
            Open
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
