import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Execution · reflection
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="mt-1 text-sm text-tx-3">
            Step back, take stock, and decide what to carry forward.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New review
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip active={filter === ""} onClick={() => setFilter("")}>
          All
        </Chip>
        {REVIEW_TYPES.map((t) => (
          <Chip
            key={t.value}
            active={filter === t.value}
            onClick={() => setFilter(t.value)}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      {showForm && <NewReviewForm onClose={() => setShowForm(false)} />}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading reviews…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your reviews. Is the backend running?
        </p>
      )}

      {reviews && reviews.length === 0 && !showForm && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No reviews yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Run your first review to start a reflection habit.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Start a review
          </Button>
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-surface-3 text-tx"
          : "border-line-2 text-tx-3 hover:text-tx",
      )}
    >
      {children}
    </button>
  );
}
