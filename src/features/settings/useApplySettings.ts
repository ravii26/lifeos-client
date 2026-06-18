import { useEffect } from "react";

import { useGetSettingsQuery } from "./settingsApi";

const FONT_MAP: Record<string, string> = {
  mono: "var(--font-mono)",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
};

function hexToRgbChannels(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function applyAccentHex(hex: string) {
  const root = document.documentElement;
  const ch = hexToRgbChannels(hex);
  root.style.setProperty("--acc", hex);
  root.style.setProperty("--acc-soft", `rgba(${ch}, 0.13)`);
  root.style.setProperty("--acc-line", `rgba(${ch}, 0.35)`);
  root.style.setProperty("--acc-glow", `rgba(${ch}, 0.22)`);
}

export function useApplySettings() {
  const { data: settings } = useGetSettingsQuery();

  useEffect(() => {
    if (!settings) return;
    document.body.style.fontFamily = FONT_MAP[settings.font] ?? "";
  }, [settings?.font]);

  useEffect(() => {
    if (!settings?.accent) return;
    applyAccentHex(settings.accent);
  }, [settings?.accent]);

  return settings;
}
