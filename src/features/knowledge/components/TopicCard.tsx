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
      className="card card-pad group flex flex-col transition-colors hover:border-line-2"
    >
      <div className="mb-2 flex items-center justify-between">
        {area && (
          <span
            className="chip border-transparent bg-surface-2"
            style={{ color: area.color }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: area.color }}
            />
            {area.name}
          </span>
        )}
        {mastery && (
          <span className={cn("font-mono text-[10px]", mastery.tone)}>
            {mastery.label}
          </span>
        )}
      </div>

      <div className="text-[14.5px] font-semibold">{topic.title}</div>
      {topic.description && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-tx-3">
          {topic.description}
        </p>
      )}

      <div className="mt-3.5 flex items-center gap-1 text-xs text-tx-4 transition-colors group-hover:text-tx-2">
        Open topic
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
