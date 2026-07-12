/**
 * Single source of truth for LifeOS modules on the web client.
 *
 * Mirrors the mobile registry (`lib/core/modules/module_registry.dart`) and the
 * backend's OPTIONAL_MODULES list (settings.schema.ts) so the three layers agree
 * on what can be turned off. Core modules are structurally load-bearing and are
 * never stored or shown as toggles.
 */

// behaviour/graph/decisions are listed as core here (not user-toggleable):
// their toggle never actually gated the underlying telemetry/fetches, only
// nav visibility, which gave a false impression of control. They stay
// always-on until real gating is built.
/** Core modules — always on, never persisted, never gated. */
export const CORE_MODULES = [
  "areas",
  "tasks",
  "capture",
  "behaviour",
  "graph",
  "decisions",
] as const;

export type ModuleKey =
  | (typeof CORE_MODULES)[number]
  | (typeof OPTIONAL_MODULES)[number];

/** Optional (user-toggleable) modules. Order matches the backend enum. */
export const OPTIONAL_MODULES = [
  "habits",
  "goals",
  "projects",
  "calendar",
  "knowledge",
  "vault",
  "focus",
  "review",
  "learn",
  "identity",
  "library",
] as const;

export type OptionalModuleKey = (typeof OPTIONAL_MODULES)[number];

export interface ModuleMeta {
  key: OptionalModuleKey;
  label: string;
  desc: string;
}

/** Display metadata for the Settings toggle UI (optional modules only). */
export const OPTIONAL_MODULE_META: ModuleMeta[] = [
  { key: "habits", label: "Habits", desc: "Recurring habits & reminders" },
  { key: "goals", label: "Goals", desc: "What you're aiming at" },
  { key: "projects", label: "Projects", desc: "Bodies of work in motion" },
  { key: "calendar", label: "Calendar", desc: "Time-blocked day" },
  { key: "knowledge", label: "Notebooks", desc: "Topics, notebooks & notes" },
  { key: "vault", label: "Vault", desc: "Wins, quotes & protocols" },
  { key: "focus", label: "Focus", desc: "Immersive timer" },
  { key: "review", label: "Weekly Review", desc: "Reflect & integrate insights" },
  { key: "learn", label: "Learn", desc: "Courses, notes & resources" },
  { key: "identity", label: "Identity", desc: "Purpose, values & vision" },
  { key: "library", label: "Library", desc: "Ask questions of your documents" },
];

const CORE_SET = new Set<string>(CORE_MODULES);
const OPTIONAL_SET = new Set<string>(OPTIONAL_MODULES);

/**
 * Resolves the raw `enabledModules` array from the backend into the effective
 * set of enabled module keys. An empty list means "all optional modules on"
 * (matches mobile + brand-new accounts), so older data and new accounts behave
 * identically.
 */
export function resolveEnabled(raw: string[] | undefined | null): Set<string> {
  const enabled = new Set<string>(CORE_SET);
  if (!raw || raw.length === 0) {
    OPTIONAL_SET.forEach((k) => enabled.add(k));
  } else {
    raw.filter((k) => OPTIONAL_SET.has(k)).forEach((k) => enabled.add(k));
  }
  return enabled;
}
