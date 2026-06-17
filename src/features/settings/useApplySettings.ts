import { useEffect } from "react";

import { useGetSettingsQuery } from "./settingsApi";

const FONT_MAP: Record<string, string> = {
  mono: "var(--font-mono)",
  serif: "ui-serif, Georgia, 'Times New Roman', serif",
};

export function useApplySettings() {
  const { data: settings } = useGetSettingsQuery();

  useEffect(() => {
    if (!settings) return;
    document.body.style.fontFamily = FONT_MAP[settings.font] ?? "";
  }, [settings?.font]);

  return settings;
}
