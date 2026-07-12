import { useEffect } from "react";

import { useGetSettingsQuery } from "./settingsApi";
import type { Vibe } from "./types";
import { applyAccent, resolveAccentId } from "@/features/tweaks/theme";

// "serif" is a personal reading-preference override, decoupled from the
// brand voice token (--display is Archivo now, not a serif) — a plain
// system serif stack, not a webfont, since it's a rarely-used accessibility
// toggle rather than part of the identity.
const FONT_MAP: Record<string, string> = {
  mono: "var(--font-mono)",
  serif: "Georgia, 'Times New Roman', serif",
};

function applyVibe(vibe: Vibe) {
  document.documentElement.dataset.vibe = vibe;
}

export function useApplySettings() {
  const { data: settings } = useGetSettingsQuery();

  useEffect(() => {
    if (!settings) return;
    document.body.style.fontFamily = FONT_MAP[settings.font] ?? "";
  }, [settings?.font]);

  useEffect(() => {
    if (!settings?.accent) return;
    // Backend may hold a legacy neon hex or a preset id — resolveAccentId
    // maps either onto the current print-ink palette, and applyAccent
    // keeps localStorage in sync so TweaksPanel reads the right value.
    applyAccent(resolveAccentId(settings.accent));
  }, [settings?.accent]);

  useEffect(() => {
    applyVibe(settings?.vibe ?? "focused");
  }, [settings?.vibe]);

  return settings;
}
