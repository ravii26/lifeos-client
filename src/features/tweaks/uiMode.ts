import { useSyncExternalStore } from "react";

/**
 * UI mode: "brutalist" is the current design (zero radius, hard borders,
 * numbered nav index); "classic" restores the original dark dashboard
 * (rounded cards, hairline borders, icon nav) via the `[data-ui="classic"]`
 * CSS overrides in index.css. Persisted locally — this is a personal
 * device preference, not synced to the account.
 */
export type UIMode = "brutalist" | "classic";

const STORAGE_KEY = "lifeos.uiMode";
export const DEFAULT_UI_MODE: UIMode = "brutalist";

const listeners = new Set<() => void>();

export function getSavedUIMode(): UIMode {
  return localStorage.getItem(STORAGE_KEY) === "classic" ? "classic" : DEFAULT_UI_MODE;
}

/** Apply + persist the chosen UI mode, then notify subscribers (e.g. Sidebar). */
export function applyUIMode(mode: UIMode) {
  localStorage.setItem(STORAGE_KEY, mode);
  document.documentElement.dataset.ui = mode;
  listeners.forEach((l) => l());
}

/** Call once on app start to restore the saved UI mode. */
export function initUIMode() {
  document.documentElement.dataset.ui = getSavedUIMode();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Live-reads the current UI mode; re-renders the component when it changes. */
export function useUIMode(): UIMode {
  return useSyncExternalStore(subscribe, getSavedUIMode, getSavedUIMode);
}
