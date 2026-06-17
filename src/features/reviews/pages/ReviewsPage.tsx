import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Stat } from "@/components/ui/Stat";
import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";

import { useListReviewsQuery } from "../reviewsApi";
import { REVIEW_TYPES } from "../constants";
import { ReviewCard } from "../components/ReviewCard";
import { NewReviewForm } from "../components/NewReviewForm";
import type { ReviewType } from "../types";

export function ReviewsPage() {
  const [filter, setFilter] = useState<ReviewType | "">("");
  const {
    data: reviews,
    isLoading,
    isError,
  } = useListReviewsQuery(filter ? { reviewType: filter } : undefined);
  const [showForm, setShowForm] = useState(false);
  useLogBehaviorOnMount("REVIEW_OPENED");

  const all = reviews ?? [];
  const now = new Date();
  const thisMonth = all.filter((r) => {
    const d = new Date(r.periodStart);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const weekly = all.filter((r) => r.reviewType === "WEEKLY").length;
  const withAi = all.filter((r) => r.aiInsights).length;

  const stats = [
    { num: all.length, label: "Total reviews" },
    { num: thisMonth, label: "This month", color: "var(--acc)" },
    { num: weekly, label: "Weekly" },
    { num: withAi, label: "With AI insights" },
  ];

  return (
    <div className="page rise" style={{ maxWidth: 1000 }}>
      <div className="page-head flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Execution · reflection</div>
          <h1 className="page-title">Weekly Review</h1>
          <div className="page-sub">
            Step back, take stock, and decide what to carry forward.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ds-btn ghost"
        >
          <Plus className="size-3.5" /> New review
        </button>
      </div>

      <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
        {stats.map((x) => (
          <div key={x.label} className="card card-pad">
            <Stat num={x.num} label={x.label} color={x.color} />
          </div>
        ))}
      </div>

      <div className="mb-[var(--gap)] flex flex-wrap gap-1.5">
        <button
          type="button"
          className={cn("tag-toggle", filter === "" && "on")}
          onClick={() => setFilter("")}
        >
          All
        </button>
        {REVIEW_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={cn("tag-toggle", filter === t.value && "on")}
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewReviewForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading reviews…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your reviews. Is the backend running?
        </p>
      )}

      {all.length > 0 && (
        <div className="grid gap-[var(--gap)] sm:grid-cols-2 lg:grid-cols-3">
          {all.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {reviews && all.length === 0 && !showForm && (
        <div className="card card-pad empty">
          No reviews yet — run your first to start a reflection habit.
        </div>
      )}
    </div>
  );
}
