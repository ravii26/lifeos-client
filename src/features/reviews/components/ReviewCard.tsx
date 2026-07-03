import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { REVIEW_TYPE_LABEL } from "../constants";
import type { Review } from "../types";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Link
      to={`/review/${review.id}`}
      className="card card-pad group flex flex-col transition-colors hover:border-line-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">
            {REVIEW_TYPE_LABEL[review.reviewType] ?? review.reviewType}
          </span>
          <div className="text-sm font-semibold">
            {fmt(review.periodStart)} – {fmt(review.periodEnd)}
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-tx-4 transition-transform group-hover:translate-x-0.5 group-hover:text-tx-2" />
      </div>

      {review.summary && (
        <p className="mt-2 line-clamp-2 text-xs text-tx-3">{review.summary}</p>
      )}

      {review.aiInsights && (
        <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-tx-4">
          <Sparkles className="size-3" /> AI insights ready
        </span>
      )}
    </Link>
  );
}
