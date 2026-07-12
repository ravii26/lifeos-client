import { useEffect, useState } from "react";
import { Check, Moon, Sun, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUpdateSettingsMutation } from "@/features/settings/settingsApi";
import {
  ACCENTS,
  applyAccent,
  applyTheme,
  DEFAULT_ACCENT_ID,
  getSavedAccentId,
  getSavedTheme,
  type ThemeId,
} from "./theme";
import { applyUIMode, useUIMode, type UIMode } from "./uiMode";

export function TweaksPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [accentId, setAccentId] = useState(getSavedAccentId);
  const [theme, setTheme] = useState<ThemeId>(getSavedTheme);
  const uiMode = useUIMode();
  const [updateSettings] = useUpdateSettingsMutation();

  // Keep local state in sync with localStorage (e.g. after server sets it)
  useEffect(() => {
    setAccentId(getSavedAccentId());
    setTheme(getSavedTheme());
  }, [open]);

  const choose = (id: string) => {
    setAccentId(id);
    applyAccent(id); // live repaints :root immediately + saves to localStorage

    // Persist to server (fire-and-forget — swallow errors silently)
    const accent = ACCENTS.find((a) => a.id === id);
    if (accent) {
      updateSettings({ accent: accent.acc }).catch(() => {/* ignore */});
    }
  };

  const chooseTheme = (t: ThemeId) => {
    setTheme(t);
    applyTheme(t); // local-only for now — backend settings has no theme field yet
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close tweaks"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />

      {/* Slide-over */}
      <aside
        className="fixed top-0 right-0 z-50 flex h-screen w-80 flex-col border-l-2 border-tx bg-surface-1"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <div className="flex h-14 items-center justify-between border-b-2 border-tx px-5">
          <span className="font-display text-[15px] font-bold">Tweaks</span>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center text-tx-3 hover:bg-surface-3 hover:text-tx"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="eyebrow">Layout</div>
          <p className="mt-1 text-xs text-tx-3">
            Brutalist is the current look. Classic brings back the earlier
            rounded, dark dashboard. Saved on this device.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(
              [
                { id: "brutalist" as UIMode, label: "Brutalist" },
                { id: "classic" as UIMode, label: "Classic" },
              ]
            ).map((m) => {
              const active = uiMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => applyUIMode(m.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 border-2 p-3 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "border-tx bg-acc text-acc-ink"
                      : "border-tx text-tx-2 hover:bg-surface-2",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="eyebrow mt-7">Theme</div>
          <p className="mt-1 text-xs text-tx-3">
            Paper for daylight, night ink for the evening. Saved on this device.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(
              [
                { id: "paper" as ThemeId, label: "Paper", icon: Sun },
                { id: "night" as ThemeId, label: "Night ink", icon: Moon },
              ]
            ).map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => chooseTheme(t.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 border-2 p-3 text-[12.5px] font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "border-tx bg-acc text-acc-ink"
                      : "border-tx text-tx-2 hover:bg-surface-2",
                  )}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="eyebrow mt-7">Accent ink</div>
          <p className="mt-1 text-xs text-tx-3">
            The annotation color — checks, marks, progress. Synced across devices.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {ACCENTS.map((a) => {
              const active = a.id === accentId;
              const swatch = theme === "night" ? a.night : a;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => choose(a.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 border-2 p-3 transition-colors",
                    active ? "border-tx bg-surface-3" : "border-tx hover:bg-surface-2",
                  )}
                >
                  <span
                    className="relative grid size-9 place-items-center border-2 border-tx"
                    style={{ backgroundColor: swatch.acc, color: swatch.ink }}
                  >
                    {active && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="text-[11px] text-tx-2">{a.label}</span>
                </button>
              );
            })}
          </div>

          {accentId !== DEFAULT_ACCENT_ID && (
            <button
              type="button"
              onClick={() => choose(DEFAULT_ACCENT_ID)}
              className="mt-5 text-xs text-tx-3 hover:text-tx"
            >
              Reset to default
            </button>
          )}
        </div>

        <div className="border-t-2 border-tx px-5 py-3 text-[11px] text-tx-4">
          Accent syncs to your account; theme stays on this browser.
        </div>
      </aside>
    </>
  );
}
