import {
  Brain,
  Briefcase,
  Dumbbell,
  Heart,
  type LucideIcon,
  Palette,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";

/** Preset colors offered in the create form (flat poster colors). */
export const AREA_COLORS = [
  "#1a56ff", // signal blue
  "#00a651", // toxic green
  "#7b2ff7", // ultraviolet
  "#d6a200", // hazard mustard
  "#ff2f6e", // hot magenta
  "#ffb400", // amber
];

/**
 * Areas created in either earlier pass (original neon, then "Ink & Paper"
 * muted prints) have those older hexes stored in the DB. Normalize both
 * generations straight to the current poster palette at read time so old
 * accounts don't render a color that no longer exists. Unknown/custom
 * colors pass through untouched.
 */
const LEGACY_AREA_COLOR_MAP: Record<string, string> = {
  // original neon era
  "#4f8cff": "#1a56ff",
  "#2dd4a7": "#00a651",
  "#a884ff": "#7b2ff7",
  "#c5f23f": "#d6a200",
  "#ff6b81": "#ff2f6e",
  "#ff9d4d": "#ffb400",
  // "Ink & Paper" era
  "#3f56b5": "#1a56ff",
  "#337a5b": "#00a651",
  "#7a4fae": "#7b2ff7",
  "#96721c": "#d6a200",
  "#b54458": "#ff2f6e",
  "#b55f24": "#ffb400",
};

export function normalizeAreaColor(color: string): string {
  return LEGACY_AREA_COLOR_MAP[color?.toLowerCase?.() ?? ""] ?? color;
}

/** Preset icons. The backend stores the chosen `name` string. */
export const AREA_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "briefcase", Icon: Briefcase },
  { name: "heart", Icon: Heart },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "wallet", Icon: Wallet },
  { name: "brain", Icon: Brain },
  { name: "users", Icon: Users },
  { name: "palette", Icon: Palette },
  { name: "sparkles", Icon: Sparkles },
];

const ICON_BY_NAME: Record<string, LucideIcon> = Object.fromEntries(
  AREA_ICONS.map((i) => [i.name, i.Icon]),
);

/** Resolve a stored icon name back to its component (fallback: Target). */
export function areaIcon(name: string): LucideIcon {
  return ICON_BY_NAME[name] ?? Target;
}
