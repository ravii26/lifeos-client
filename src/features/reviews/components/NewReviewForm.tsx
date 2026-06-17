import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateReviewMutation } from "../reviewsApi";
import { REVIEW_TYPES, periodFor, toDateInput } from "../constants";
import type { ReviewType } from "../types";

const textareaClass =
  "w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring";

export function NewReviewForm({ onClose }: { onClose: () => void }) {
  const initial = periodFor("WEEKLY");
  const [reviewType, setReviewType] = useState<ReviewType>("WEEKLY");
  const [periodStart, setPeriodStart] = useState(toDateInput(initial.start));
  const [periodEnd, setPeriodEnd] = useState(toDateInput(initial.end));
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState("");
  const [improvements, setImprovements] = useState("");
  const [userNote, setUserNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const onTypeChange = (t: ReviewType) => {
    setReviewType(t);
    const p = periodFor(t);
    setPeriodStart(toDateInput(p.start));
    setPeriodEnd(toDateInput(p.end));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodStart || !periodEnd) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createReview({
        reviewType,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        ...(summary.trim() ? { summary: summary.trim() } : {}),
        ...(highlights.trim() ? { highlights: highlights.trim() } : {}),
        ...(improvements.trim() ? { improvements: improvements.trim() } : {}),
        ...(userNote.trim() ? { userNote: userNote.trim() } : {}),
      }).unwrap();
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-line bg-surface-1 p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={reviewType} onValueChange={(v) => onTypeChange(v as ReviewType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVIEW_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-start">Period start</Label>
          <DateInput
            id="review-start"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            aria-invalid={!!fieldErrors.periodStart}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-end">Period end</Label>
          <DateInput
            id="review-end"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            aria-invalid={!!fieldErrors.periodEnd}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="review-summary">Summary</Label>
        <textarea
          id="review-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="How did this period go overall?"
          rows={3}
          className={textareaClass}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-highlights">Highlights</Label>
          <textarea
            id="review-highlights"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            placeholder="What went well?"
            rows={3}
            className={textareaClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-improvements">Improvements</Label>
          <textarea
            id="review-improvements"
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="What could be better?"
            rows={3}
            className={textareaClass}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="review-note">Personal note</Label>
        <textarea
          id="review-note"
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Anything else worth remembering…"
          rows={2}
          className={textareaClass}
        />
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save review"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
