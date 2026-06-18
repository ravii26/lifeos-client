import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat } from "@/components/ui/Stat";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/store/hooks";
import { useGetStatsQuery } from "@/features/auth/authApi";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useGetIdentityQuery, useUpdateIdentityMutation } from "../identityApi";
import type { Identity } from "../types";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/settings/settingsApi";
import type { FontPreference, StartTab, Vibe } from "@/features/settings/types";

const textareaClass =
  "w-full resize-y rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line";

const splitTags = (raw: string) =>
  raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export function IdentityPage() {
  const user = useAppSelector(selectCurrentUser);
  const { data: identity, isLoading } = useGetIdentityQuery();
  const { data: stats } = useGetStatsQuery();
  const { data: areas } = useListAreasQuery();

  const tasksDone = stats?.tasksDone ?? 0;
  const habitsLogged = stats?.habitsLogged ?? 0;
  const focusHours = stats ? Math.round(stats.focusHours * 10) / 10 : 0;
  const areaCount = (areas ?? []).length;
  const initial = user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="page rise" style={{ maxWidth: 920 }}>
      <div className="page-head">
        <div className="eyebrow">Account</div>
        <h1 className="page-title">Settings</h1>
        <div className="page-sub">
          Your profile, identity compass, and lifetime momentum.
        </div>
      </div>

      {/* Profile header */}
      <div className="card card-pad mb-[var(--gap)] flex items-center gap-4">
        <div
          className="grid size-[60px] shrink-0 place-items-center rounded-2xl text-2xl font-extrabold text-[var(--acc-ink)]"
          style={{ background: "linear-gradient(135deg, var(--acc), var(--health))" }}
        >
          {initial}
        </div>
        <div className="flex-1">
          <div className="text-[17px] font-[650]">{user?.name ?? "—"}</div>
          <div className="text-[13px] text-tx-3">{user?.email}</div>
          <div className="mt-1 font-mono text-[11px] text-tx-4">
            {tasksDone} tasks done · {habitsLogged} habits logged · {areaCount} areas
          </div>
        </div>
      </div>

      {/* Lifetime stats — real numbers from GET /auth/stats (B10). */}
      <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
        <div className="card card-pad">
          <Stat num={tasksDone} label="Tasks completed" />
        </div>
        <div className="card card-pad">
          <Stat num={habitsLogged} label="Habits logged" />
        </div>
        <div className="card card-pad">
          <Stat num={`${focusHours}h`} label="Focus hours" color="var(--acc)" />
        </div>
        <div className="card card-pad">
          <Stat num={areaCount} label="Life areas" />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-tx-3">Loading your identity…</p>
      ) : (
        <IdentityForm key={identity?.id ?? "new"} identity={identity ?? null} />
      )}

      <div className="mt-[var(--gap)]">
        <AppSettingsCard />
      </div>
    </div>
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
    <form onSubmit={handleSubmit} className="card card-pad">
      <div className="eyebrow mb-1">Profile · who you are</div>
      <div className="card-title mb-4 text-[15px]">Identity compass</div>

      <div className="space-y-5">
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
      </div>
    </form>
  );
}

function AppSettingsCard() {
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();

  const [vibe, setVibe] = useState<Vibe>("focused");
  const [font, setFont] = useState<FontPreference>("inter");
  const [startTab, setStartTab] = useState<StartTab>("today");

  // Sync form state whenever settings load from the server.
  useEffect(() => {
    if (!settings) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVibe(settings.vibe ?? "focused");
    setFont(settings.font ?? "inter");
    setStartTab(settings.startTab ?? "today");
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ vibe, font, startTab });
  };

  return (
    <form onSubmit={handleSave} className="card card-pad">
      <div className="eyebrow mb-1">Preferences · appearance</div>
      <div className="card-title mb-4 text-[15px]">App settings</div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-tx-2">Vibe</label>
          <Select value={vibe} onValueChange={(v) => setVibe(v as Vibe)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="focused">Focused</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-tx-2">Font</label>
          <Select value={font} onValueChange={(v) => setFont(v as FontPreference)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter (default)</SelectItem>
              <SelectItem value="mono">Mono</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-tx-2">Start tab</label>
          <Select value={startTab} onValueChange={(v) => setStartTab(v as StartTab)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="areas">Areas</SelectItem>
              <SelectItem value="dump">Dump</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
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
