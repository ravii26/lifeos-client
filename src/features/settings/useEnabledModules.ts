import { useMemo } from "react";

import { useGetSettingsQuery } from "./settingsApi";
import { resolveEnabled } from "./modules";

/**
 * Reads the user's enabled modules from `/settings` and exposes a cheap
 * `isEnabled(key)` check. Mirrors the mobile AppearanceCubit gating so a module
 * the user disabled on any device stays hidden on the web too.
 *
 * While settings are still loading we treat everything as enabled, so the nav
 * never flickers items out from under the user on first paint.
 */
export function useEnabledModules() {
  const { data: settings, isLoading } = useGetSettingsQuery();

  const enabled = useMemo(
    () => resolveEnabled(settings?.enabledModules),
    [settings?.enabledModules],
  );

  return {
    isLoading,
    enabled,
    /** Core modules and unknown keys are always considered enabled. */
    isEnabled: (key: string) => isLoading || enabled.has(key),
  };
}
