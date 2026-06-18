import {
  AudioLines,
  FileText,
  Flame,
  Image as ImageIcon,
  LifeBuoy,
  Lightbulb,
  Camera,
  Quote,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { MediaType, VaultType } from "./types";

/** Vault categories. `accent` is a fixed hue per type for the card stripe. */
export const VAULT_TYPES: {
  value: VaultType;
  label: string;
  hint: string;
  accent: string;
  icon: LucideIcon;
}[] = [
  {
    value: "REFLECTION",
    label: "Reflection",
    hint: "Lessons & realizations",
    accent: "#4f8cff",
    icon: Lightbulb,
  },
  {
    value: "MEMORY",
    label: "Memory",
    hint: "Moments worth keeping",
    accent: "#a884ff",
    icon: Camera,
  },
  {
    value: "MOTIVATION",
    label: "Motivation",
    hint: "Fuel to keep going",
    accent: "#c5f23f",
    icon: Flame,
  },
  {
    value: "RECOVERY",
    label: "Recovery",
    hint: "For the hard days",
    accent: "#2dd4a7",
    icon: LifeBuoy,
  },
];

export const VAULT_TYPE_BY_VALUE = Object.fromEntries(
  VAULT_TYPES.map((v) => [v.value, v]),
) as Record<VaultType, (typeof VAULT_TYPES)[number]>;

export const MEDIA_TYPES: { value: MediaType; label: string; icon: LucideIcon }[] =
  [
    { value: "TEXT", label: "Text", icon: FileText },
    { value: "QUOTE", label: "Quote", icon: Quote },
    { value: "VIDEO", label: "Video", icon: Video },
    { value: "AUDIO", label: "Audio", icon: AudioLines },
    { value: "IMAGE", label: "Image", icon: ImageIcon },
  ];

export const MEDIA_TYPE_BY_VALUE = Object.fromEntries(
  MEDIA_TYPES.map((m) => [m.value, m]),
) as Record<MediaType, (typeof MEDIA_TYPES)[number]>;
