import type { MediaType, VaultType } from "./types";

/** Vault categories. `accent` is a fixed hue per type for the card stripe. */
export const VAULT_TYPES: {
  value: VaultType;
  label: string;
  hint: string;
  accent: string;
}[] = [
  {
    value: "REFLECTION",
    label: "Reflection",
    hint: "Lessons & realizations",
    accent: "#4f8cff",
  },
  {
    value: "MEMORY",
    label: "Memory",
    hint: "Moments worth keeping",
    accent: "#a884ff",
  },
  {
    value: "MOTIVATION",
    label: "Motivation",
    hint: "Fuel to keep going",
    accent: "#c5f23f",
  },
  {
    value: "RECOVERY",
    label: "Recovery",
    hint: "For the hard days",
    accent: "#2dd4a7",
  },
];

export const VAULT_TYPE_BY_VALUE = Object.fromEntries(
  VAULT_TYPES.map((v) => [v.value, v]),
) as Record<VaultType, (typeof VAULT_TYPES)[number]>;

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "QUOTE", label: "Quote" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "IMAGE", label: "Image" },
];
