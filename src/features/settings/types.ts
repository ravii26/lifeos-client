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
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsRequest {
  vibe?: Vibe;
  accent?: string;
  font?: FontPreference;
  startTab?: StartTab;
}
