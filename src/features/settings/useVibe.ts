import { useGetSettingsQuery } from "./settingsApi";
import type { Vibe } from "./types";
import { VIBE_CONFIG, type VibeConfig } from "./vibeConfig";

export function useVibe(): Vibe {
  const { data: settings } = useGetSettingsQuery();
  return settings?.vibe ?? "focused";
}

/** Returns the active vibe's curation config. Prefer this over useVibe() for
 *  feature flags, so component logic reads intent (cfg.showStreaks) not strings. */
export function useVibeConfig(): VibeConfig {
  return VIBE_CONFIG[useVibe()];
}
