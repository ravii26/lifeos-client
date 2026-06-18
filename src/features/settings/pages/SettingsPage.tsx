import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { useGetSettingsQuery, useUpdateSettingsMutation } from "../settingsApi";
import type { FontPreference, StartTab, UpdateSettingsRequest, Vibe } from "../types";

const VIBE_OPTIONS: { value: Vibe; label: string; desc: string }[] = [
  { value: "calm", label: "Calm", desc: "Soft, relaxed energy" },
  { value: "focused", label: "Focused", desc: "Sharp, distraction-free" },
  { value: "energetic", label: "Energetic", desc: "High intensity, motivated" },
];

const FONT_OPTIONS: { value: FontPreference; label: string }[] = [
  { value: "inter", label: "Inter (default)" },
  { value: "mono", label: "Monospace" },
  { value: "serif", label: "Serif" },
];

const START_TAB_OPTIONS: { value: StartTab; label: string }[] = [
  { value: "today", label: "Dashboard" },
  { value: "areas", label: "Areas" },
  { value: "dump", label: "Dump" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line pb-5 last:border-0 last:pb-0">
      <div className="text-sm font-semibold text-tx">{label}</div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();

  const [draft, setDraft] = useState<UpdateSettingsRequest>({});

  const val = <K extends keyof UpdateSettingsRequest>(
    key: K,
    fallback: UpdateSettingsRequest[K],
  ): UpdateSettingsRequest[K] =>
    (key in draft ? draft[key] : settings?.[key] ?? fallback) as UpdateSettingsRequest[K];

  const set = <K extends keyof UpdateSettingsRequest>(key: K, value: UpdateSettingsRequest[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    if (!Object.keys(draft).length) return;
    try {
      await updateSettings(draft).unwrap();
      setDraft({});
      toast.success("Settings saved");
    } catch {
      toast.error("Couldn't save settings");
    }
  };

  if (isLoading) return <div className="page"><p className="text-sm text-tx-3 pt-8">Loading settings…</p></div>;

  return (
    <div className="page rise">
      <div className="page-head">
        <div className="eyebrow">Preferences</div>
        <h1 className="page-title">Settings</h1>
        <div className="page-sub">Personalise your LifeOS experience.</div>
      </div>

      <div className="card card-pad flex flex-col gap-6 max-w-lg">
        <Row label="Vibe">
          <div className="flex gap-2">
            {VIBE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("vibe", o.value)}
                className={[
                  "flex-1 rounded-[var(--r-sm)] border px-3 py-2.5 text-left transition-colors",
                  val("vibe", "calm") === o.value
                    ? "border-acc-line bg-acc-soft text-tx"
                    : "border-line bg-surface-2 text-tx-2 hover:border-line-2",
                ].join(" ")}
              >
                <div className="text-[13px] font-semibold">{o.label}</div>
                <div className="mt-0.5 text-[11px] text-tx-3">{o.desc}</div>
              </button>
            ))}
          </div>
        </Row>

        <Row label="Accent colour">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={val("accent", "#6366f1") as string}
              onChange={(e) => set("accent", e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-line bg-transparent p-0.5"
            />
            <span className="font-mono text-sm text-tx-3">{val("accent", "#6366f1") as string}</span>
          </div>
        </Row>

        <Row label="Font">
          <div className="flex gap-2">
            {FONT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("font", o.value)}
                className={[
                  "rounded-[var(--r-sm)] border px-3 py-2 text-[13px] transition-colors",
                  val("font", "inter") === o.value
                    ? "border-acc-line bg-acc-soft text-tx font-semibold"
                    : "border-line bg-surface-2 text-tx-2 hover:border-line-2",
                ].join(" ")}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Start tab">
          <div className="flex gap-2">
            {START_TAB_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("startTab", o.value)}
                className={[
                  "rounded-[var(--r-sm)] border px-3 py-2 text-[13px] transition-colors",
                  val("startTab", "today") === o.value
                    ? "border-acc-line bg-acc-soft text-tx font-semibold"
                    : "border-line bg-surface-2 text-tx-2 hover:border-line-2",
                ].join(" ")}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Row>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !Object.keys(draft).length}
          className="ds-btn acc self-start"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
