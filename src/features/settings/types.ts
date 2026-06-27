export type Vibe = "calm" | "focused" | "energetic";
export type FontPreference = "inter" | "mono" | "serif";
export type StartTab = "today" | "areas" | "dump";

export interface UserSettings {
  id: string;
  userId: string;
  vibe: Vibe;
  accent: string;
  font: FontPreference;
  startTab: StartTab;
  /** Optional modules the user has enabled. Empty array == all optional on. */
  enabledModules?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsRequest {
  vibe?: Vibe;
  accent?: string;
  font?: FontPreference;
  startTab?: StartTab;
  enabledModules?: string[];
}
