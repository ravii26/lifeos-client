import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Area } from "@/features/areas/types";

import { MASTERY_BY_VALUE } from "../constants";
import type { Topic } from "../types";

export function TopicCard({ topic, area }: { topic: Topic; area?: Area }) {
  const mastery = topic.masteryLevel
    ? MASTERY_BY_VALUE[topic.masteryLevel]
    : undefined;

  return (
    <Link
      to={`/learn/${topic.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-semibold">{topic.title}</span>
        <ArrowRight className="size-4 shrink-0 text-tx-4 transition-transform group-hover:translate-x-0.5 group-hover:text-tx-2" />
      </div>

      {topic.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-tx-3">
          {topic.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {area && (
          <span className="flex items-center gap-1.5 text-[11px] text-tx-3">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: area.color }}
            />
            {area.name}
          </span>
        )}
        {mastery && (
          <span className={cn("text-[11px] font-medium", mastery.tone)}>
            {mastery.label}
          </span>
        )}
      </div>
    </Link>
  );
}
