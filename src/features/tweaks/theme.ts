/**
 * Runtime theming. Each accent preset overrides the three `--acc*` CSS
 * variables on :root — and because shadcn's `primary` maps to `--acc`, the
 * whole UI re-tints live with no re-render. Choice is persisted in localStorage.
 */
export interface Accent {
  id: string;
  label: string;
  acc: string;
  acc2: string;
  ink: string;
}

export const ACCENTS: Accent[] = [
  { id: "chartreuse", label: "Chartreuse", acc: "#c5f23f", acc2: "#d4fa66", ink: "#11160a" },
  { id: "blue", label: "Blue", acc: "#4f8cff", acc2: "#6ba0ff", ink: "#061226" },
  { id: "violet", label: "Violet", acc: "#a884ff", acc2: "#bda0ff", ink: "#160a2b" },
  { id: "teal", label: "Teal", acc: "#2dd4a7", acc2: "#4ee0bb", ink: "#04201a" },
  { id: "pink", label: "Pink", acc: "#ff6b81", acc2: "#ff8b9c", ink: "#2b060d" },
  { id: "orange", label: "Orange", acc: "#ff9d4d", acc2: "#ffb574", ink: "#2b1505" },
];

const STORAGE_KEY = "lifeos.accent";
export const DEFAULT_ACCENT_ID = "chartreuse";

export function getAccentById(id: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

export function getSavedAccentId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ACCENT_ID;
}

/** "#c5f23f" → "197, 242, 63" for building rgba() strings. */
function rgbChannels(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Write the accent's variables onto :root (incl. soft/line/glow tints). */
function paint(accent: Accent) {
  const root = document.documentElement;
  const ch = rgbChannels(accent.acc);
  root.style.setProperty("--acc", accent.acc);
  root.style.setProperty("--acc-2", accent.acc2);
  root.style.setProperty("--acc-ink", accent.ink);
  // Same opacities the design's ds.css uses.
  root.style.setProperty("--acc-soft", `rgba(${ch}, 0.13)`);
  root.style.setProperty("--acc-line", `rgba(${ch}, 0.35)`);
  root.style.setProperty("--acc-glow", `rgba(${ch}, 0.22)`);
}

/** Apply + persist a chosen accent. */
export function applyAccent(id: string) {
  const accent = getAccentById(id);
  paint(accent);
  localStorage.setItem(STORAGE_KEY, accent.id);
}

/** Call once on app start to restore the saved accent. */
export function initTheme() {
  paint(getAccentById(getSavedAccentId()));
}
