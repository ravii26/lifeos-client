export type VaultType = "REFLECTION" | "MEMORY" | "MOTIVATION" | "RECOVERY";
export type MediaType = "TEXT" | "QUOTE" | "VIDEO" | "AUDIO" | "IMAGE";

export interface VaultItem {
  id: string;
  title: string;
  content: string;
  vaultType: VaultType;
  mediaType?: MediaType | null;
  url?: string | null;
  triggerTags?: string[] | null;
  // Read-only — never send.
  usedCount?: number | null;
  helpfulCount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVaultRequest {
  title: string;
  content: string;
  vaultType: VaultType;
  mediaType?: MediaType;
  url?: string;
  triggerTags?: string[];
}

export type UpdateVaultRequest = Partial<CreateVaultRequest>;
