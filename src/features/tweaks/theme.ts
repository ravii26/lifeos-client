/**
 * Runtime theming. Each accent preset overrides the `--acc*` CSS variables
 * on :root, and the whole UI re-tints live with no re-render. Accent is the
 * one shock color — CTAs, active marks, progress — used sparingly against
 * an otherwise ink/paper palette; it is NOT the same as `--danger`, which
 * stays reserved for destructive actions regardless of accent choice.
 * The light/night theme is a `data-theme` attribute on <html>.
 * Both choices are persisted in localStorage.
 */
export interface Accent {
  id: string;
  label: string;
  acc: string;
  acc2: string;
  ink: string;
  /** Variant used automatically by the night theme. */
  night: { acc: string; acc2: string; ink: string };
}

export const ACCENTS: Accent[] = [
  {
    id: "safety-orange", label: "Safety orange",
    acc: "#ff4b1f", acc2: "#e8410c", ink: "#0a0a0a",
    night: { acc: "#ff5f2e", acc2: "#ff7648", ink: "#0a0a0a" },
  },
  {
    id: "hazard-yellow", label: "Hazard yellow",
    acc: "#ffd400", acc2: "#e8c200", ink: "#0a0a0a",
    night: { acc: "#ffdc33", acc2: "#ffe666", ink: "#0a0a0a" },
  },
  {
    id: "signal-blue", label: "Signal blue",
    acc: "#1a56ff", acc2: "#0f42d6", ink: "#ffffff",
    night: { acc: "#4d7aff", acc2: "#6690ff", ink: "#0a0a0a" },
  },
  {
    id: "toxic-green", label: "Toxic green",
    acc: "#00c853", acc2: "#00a844", ink: "#0a0a0a",
    night: { acc: "#26d16f", acc2: "#40e085", ink: "#0a0a0a" },
  },
  {
    id: "hot-magenta", label: "Hot magenta",
    acc: "#ff2f6e", acc2: "#e01a58", ink: "#ffffff",
    night: { acc: "#ff5c8a", acc2: "#ff759c", ink: "#0a0a0a" },
  },
  {
    id: "ultraviolet", label: "Ultraviolet",
    acc: "#7b2ff7", acc2: "#661fe0", ink: "#ffffff",
    night: { acc: "#9c5cff", acc2: "#ad76ff", ink: "#0a0a0a" },
  },
];

/**
 * Legacy accent ids/hexes from the two earlier passes (original neon, then
 * "Ink & Paper") that may still be stored in localStorage (ids) or backend
 * settings (hex) — mapped onto the closest brutalist preset by hue family
 * so old accounts land in the new palette instead of repainting a color
 * that no longer exists.
 */
export const LEGACY_ACCENT_MAP: Record<string, string> = {
  // "Ink & Paper" era
  "vermilion": "safety-orange", "#b23c26": "safety-orange",
  "indigo": "signal-blue", "#3f56b5": "signal-blue",
  "moss": "toxic-green", "#337a5b": "toxic-green",
  "ochre": "hazard-yellow", "#96721c": "hazard-yellow",
  "plum": "ultraviolet", "#7a4fae": "ultraviolet",
  "madder": "hot-magenta", "#b54458": "hot-magenta",
  // original neon command-center era
  "chartreuse": "hazard-yellow", "#c5f23f": "hazard-yellow",
  "blue": "signal-blue", "#4f8cff": "signal-blue",
  "violet": "ultraviolet", "#a884ff": "ultraviolet",
  "teal": "toxic-green", "#2dd4a7": "toxic-green",
  "pink": "hot-magenta", "#ff6b81": "hot-magenta",
  "orange": "safety-orange", "#ff9d4d": "safety-orange",
};

const STORAGE_KEY = "lifeos.accent";
export const DEFAULT_ACCENT_ID = "safety-orange";

export type ThemeId = "paper" | "night";
const THEME_STORAGE_KEY = "lifeos.theme";
export const DEFAULT_THEME: ThemeId = "paper";

export function getAccentById(id: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** Resolve any stored value (new id, legacy id, or legacy hex) to a valid accent id. */
export function resolveAccentId(stored: string | null): string {
  if (!stored) return DEFAULT_ACCENT_ID;
  if (ACCENTS.some((a) => a.id === stored)) return stored;
  const legacy = LEGACY_ACCENT_MAP[stored.toLowerCase()];
  if (legacy) return legacy;
  const byHex = ACCENTS.find((a) => a.acc.toLowerCase() === stored.toLowerCase());
  return byHex?.id ?? DEFAULT_ACCENT_ID;
}

export function getSavedAccentId(): string {
  return resolveAccentId(localStorage.getItem(STORAGE_KEY));
}

export function getSavedTheme(): ThemeId {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "night" ? "night" : DEFAULT_THEME;
}

/** "#ff4b1f" → "255, 75, 31" for building rgba() strings. */
function rgbChannels(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Write the accent's variables onto :root, picking the theme-correct
 * variant. `--acc-soft` is a solid pre-mixed light tint (not an rgba
 * wash) — flat poster color, not a translucent glow — computed by
 * blending the accent toward white/near-black depending on theme so it
 * still reads as a flat fill.
 */
function paint(accent: Accent) {
  const root = document.documentElement;
  const isNight = getSavedTheme() === "night";
  const variant = isNight ? accent.night : accent;
  const ch = rgbChannels(variant.acc);
  root.style.setProperty("--acc", variant.acc);
  root.style.setProperty("--acc-2", variant.acc2);
  root.style.setProperty("--acc-ink", variant.ink);
  root.style.setProperty(
    "--acc-soft",
    isNight ? `color-mix(in srgb, ${variant.acc} 16%, #0a0a0a)` : `color-mix(in srgb, ${variant.acc} 8%, #ffffff)`,
  );
  root.style.setProperty("--acc-line", variant.acc);
  root.style.setProperty("--acc-glow", `rgba(${ch}, 0.16)`);
}

/** Apply + persist a chosen accent. */
export function applyAccent(id: string) {
  const accent = getAccentById(resolveAccentId(id));
  paint(accent);
  localStorage.setItem(STORAGE_KEY, accent.id);
}

/** Apply + persist the light/night theme, then re-paint the accent variant. */
export function applyTheme(theme: ThemeId) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
  paint(getAccentById(getSavedAccentId()));
}

/** Call once on app start to restore the saved theme + accent. */
export function initTheme() {
  document.documentElement.dataset.theme = getSavedTheme();
  paint(getAccentById(getSavedAccentId()));
}
