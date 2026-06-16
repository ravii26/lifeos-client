import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useGetIdentityQuery, useUpdateIdentityMutation } from "../identityApi";
import type { Identity } from "../types";

const textareaClass =
  "w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring";

const splitTags = (raw: string) =>
  raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export function IdentityPage() {
  const { data: identity, isLoading } = useGetIdentityQuery();

  if (isLoading) {
    return <p className="p-8 text-sm text-tx-3">Loading your identity…</p>;
  }

  // Remount the form once the record resolves so its state seeds from props
  // (no seeding effect needed). `key` flips null → real id after first save.
  return (
    <IdentityForm key={identity?.id ?? "new"} identity={identity ?? null} />
  );
}

function IdentityForm({ identity }: { identity: Identity | null }) {
  const [updateIdentity, { isLoading: saving }] = useUpdateIdentityMutation();

  const [personality, setPersonality] = useState(identity?.personality ?? "");
  const [purpose, setPurpose] = useState(identity?.purpose ?? "");
  const [thisYearGoal, setThisYearGoal] = useState(
    identity?.thisYearGoal ?? "",
  );
  const [bigPicture, setBigPicture] = useState(identity?.bigPicture ?? "");
  const [lifeVision, setLifeVision] = useState(identity?.lifeVision ?? "");
  const [values, setValues] = useState((identity?.values ?? []).join(", "));
  const [strengths, setStrengths] = useState(
    (identity?.strengths ?? []).join(", "),
  );
  const [weaknesses, setWeaknesses] = useState(
    (identity?.weaknesses ?? []).join(", "),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSaved(false);
    try {
      await updateIdentity({
        ...(personality.trim() ? { personality: personality.trim() } : {}),
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
        ...(thisYearGoal.trim() ? { thisYearGoal: thisYearGoal.trim() } : {}),
        ...(bigPicture.trim() ? { bigPicture: bigPicture.trim() } : {}),
        ...(lifeVision.trim() ? { lifeVision: lifeVision.trim() } : {}),
        ...(splitTags(values).length ? { values: splitTags(values) } : {}),
        ...(splitTags(strengths).length
          ? { strengths: splitTags(strengths) }
          : {}),
        ...(splitTags(weaknesses).length
          ? { weaknesses: splitTags(weaknesses) }
          : {}),
      }).unwrap();
      setSaved(true);
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
        Support · who you are
      </div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Identity</h1>
      <p className="mt-1 text-sm text-tx-3">
        The compass everything else points to. Optional, but powerful.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Purpose" htmlFor="id-purpose">
          <textarea
            id="id-purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Why you do what you do…"
            rows={2}
            className={textareaClass}
          />
        </Field>

        <Field label="This year's goal" htmlFor="id-year">
          <Input
            id="id-year"
            value={thisYearGoal}
            onChange={(e) => setThisYearGoal(e.target.value)}
            placeholder="The one thing that matters this year"
          />
        </Field>

        <Field label="Personality" htmlFor="id-personality">
          <textarea
            id="id-personality"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="How you'd describe yourself…"
            rows={2}
            className={textareaClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Values" htmlFor="id-values" hint="comma-separated">
            <Input
              id="id-values"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder="honesty, growth…"
            />
          </Field>
          <Field label="Strengths" htmlFor="id-strengths" hint="comma-separated">
            <Input
              id="id-strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="focus, empathy…"
            />
          </Field>
          <Field
            label="Weaknesses"
            htmlFor="id-weaknesses"
            hint="comma-separated"
          >
            <Input
              id="id-weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="impatience…"
            />
          </Field>
        </div>

        <Field label="Big picture" htmlFor="id-big">
          <textarea
            id="id-big"
            value={bigPicture}
            onChange={(e) => setBigPicture(e.target.value)}
            placeholder="Where this is all heading…"
            rows={3}
            className={textareaClass}
          />
        </Field>

        <Field label="Life vision" htmlFor="id-vision">
          <textarea
            id="id-vision"
            value={lifeVision}
            onChange={(e) => setLifeVision(e.target.value)}
            placeholder="The life you're building toward…"
            rows={3}
            className={textareaClass}
          />
        </Field>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        {Object.values(fieldErrors)[0] && (
          <p className="text-sm text-danger">{Object.values(fieldErrors)[0]}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save identity"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-ok">
              <Check className="size-4" /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-[10px] text-tx-4">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
