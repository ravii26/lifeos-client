import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { runMutation } from "@/lib/run-mutation";
import { formatDate } from "@/lib/date";
import { confirm } from "@/components/ui/confirm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useDeleteInsightMutation,
  useDeleteReviewMutation,
  useGetReviewQuery,
  useListInsightsQuery,
  useUpdateInsightMutation,
  useUpdateReviewMutation,
} from "../reviewsApi";
import { INSIGHT_STATUSES, INSIGHT_STATUS_BY_VALUE, REVIEW_TYPE_LABEL } from "../constants";
import { AddInsightForm } from "../components/AddInsightForm";
import type { InsightStatus } from "../types";

const fmt = (iso: string) => formatDate(new Date(iso));

export function ReviewDetailPage() {
  const { reviewId = "" } = useParams();
  const navigate = useNavigate();

  const { data: review, isLoading, isError } = useGetReviewQuery(reviewId);
  const { data: insights, isError: insightsError } = useListInsightsQuery(reviewId);
  const [deleteReview] = useDeleteReviewMutation();
  const [updateInsight] = useUpdateInsightMutation();
  const [deleteInsight] = useDeleteInsightMutation();
  const [updateReview, { isLoading: saving }] = useUpdateReviewMutation();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");
  const [userNote, setUserNote] = useState("");

  const handleDeleteReview = async () => {
    if (!review) return;
    if (!(await confirm({
      title: "Delete this review?",
      confirmText: "Delete",
      danger: true,
    }))) return;
    await runMutation(deleteReview, review.id, {
      onSuccess: () => navigate("/review"),
      errorMessage: "Couldn't delete review",
    });
  };

  const startEdit = () => {
    if (!review) return;
    setSummary(review.summary ?? "");
    setHighlights(review.highlights ?? "");
    setImprovements(review.improvements ?? "");
    setUserNote(review.userNote ?? "");
    setEditing(true);
  };

  const handleSaveReview = async () => {
    if (!review) return;
    await runMutation(
      updateReview,
      {
        id: review.id,
        data: {
          summary: summary.trim() ? summary.trim() : null,
          highlights: highlights.trim() ? highlights.trim() : null,
          improvements: improvements.trim() ? improvements.trim() : null,
          userNote: userNote.trim() ? userNote.trim() : null,
        },
      },
      { onSuccess: () => setEditing(false), errorMessage: "Couldn't save review" },
    );
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-tx-3">Loading review…</p>;
  }
  if (isError || !review) {
    return (
      <div className="p-8">
        <p className="text-sm text-danger">Couldn't load this review.</p>
        <Link to="/review" className="mt-3 inline-block text-sm text-primary">
          ← Back to reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        to="/review"
        className="inline-flex items-center gap-1.5 text-xs text-tx-3 hover:text-tx"
      >
        <ArrowLeft className="size-3.5" /> Reviews
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">
            {REVIEW_TYPE_LABEL[review.reviewType] ?? review.reviewType} review
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {fmt(review.periodStart)} – {fmt(review.periodEnd)}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!editing && (
            <button
              type="button"
              onClick={startEdit}
              title="Edit review"
              className="grid size-8 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-tx"
            >
              <Pencil className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteReview}
            title="Delete review"
            className="grid size-8 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-6 space-y-4">
          <EditField label="Summary" value={summary} onChange={setSummary} />
          <EditField label="Highlights" value={highlights} onChange={setHighlights} />
          <EditField label="Improvements" value={improvements} onChange={setImprovements} />
          <EditField label="Personal note" value={userNote} onChange={setUserNote} />

          <div className="flex gap-2">
            <Button onClick={handleSaveReview} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Field label="Summary" value={review.summary} />
          <Field label="Highlights" value={review.highlights} />
          <Field label="Improvements" value={review.improvements} />
          <Field label="Personal note" value={review.userNote} />
        </div>
      )}

      {review.aiInsights && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.13em] text-primary">
            <Sparkles className="size-3.5" /> AI insights
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-tx-2">
            {review.aiInsights}
          </p>
        </div>
      )}

      {/* Linked insights */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Insights · {insights?.length ?? 0}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdding((v) => !v)}
            className="h-7"
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {adding && (
            <AddInsightForm
              reviewId={reviewId}
              onClose={() => setAdding(false)}
            />
          )}

          {insights?.map((insight) => {
            const status =
              INSIGHT_STATUS_BY_VALUE[insight.status ?? "PENDING"];
            return (
              <div
                key={insight.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5"
              >
                <span className={cn("size-2 shrink-0 rounded-full", status.dot)} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {insight.note?.title ?? "Linked note"}
                </span>
                <Select
                  value={insight.status ?? "PENDING"}
                  onValueChange={(v) =>
                    runMutation(
                      updateInsight,
                      {
                        insightId: insight.id,
                        reviewId,
                        data: { status: v as InsightStatus },
                      },
                      { errorMessage: "Couldn't update insight status" },
                    )
                  }
                >
                  <SelectTrigger className={cn(
                    "h-auto border-0 bg-transparent px-0 py-0 text-[11px] font-medium shadow-none focus:ring-0 [&>svg]:size-3",
                    status.tone,
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSIGHT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={async () => {
                    if (!(await confirm({
                      title: `Remove "${insight.note?.title ?? "this insight"}"?`,
                      confirmText: "Remove",
                      danger: true,
                    }))) return;
                    await runMutation(deleteInsight, { insightId: insight.id, reviewId }, {
                      errorMessage: "Couldn't remove insight",
                    });
                  }}
                  title="Remove insight"
                  className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}

          {insightsError && (
            <p className="text-sm text-danger">
              Couldn't load insights. Try refreshing.
            </p>
          )}

          {insights && insights.length === 0 && !adding && (
            <p className="text-sm text-tx-4">
              No insights linked yet — connect notes you want to act on.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-tx-2">{value}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
      />
    </div>
  );
}
