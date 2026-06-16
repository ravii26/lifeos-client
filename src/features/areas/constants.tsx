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

/** Preset colors offered in the create form (the design's life-area hues). */
export const AREA_COLORS = [
  "#4f8cff", // blue
  "#2dd4a7", // green
  "#a884ff", // violet
  "#c5f23f", // lime
  "#ff6b81", // pink
  "#ff9d4d", // orange
];

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
