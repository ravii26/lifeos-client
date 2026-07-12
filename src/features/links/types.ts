// Mirror of the server EntityType / LinkRole enums (schema.prisma).
export type EntityType =
  | "TASK"
  | "GOAL"
  | "PROJECT"
  | "RESOURCE"
  | "TOPIC"
  | "NOTE"
  | "HABIT"
  | "VAULT";

export type LinkRole = "ADVANCES" | "REFERENCES";

// Enriched link as returned by GET /links — carries both endpoints' human
// labels so a chip can render without resolving bare ids client-side.
export interface EntityLink {
  id: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  role: LinkRole;
  weight?: number | null;
  createdAt: string;
  fromLabel: string;
  toLabel: string;
}

export interface CreateLinkRequest {
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  role?: LinkRole;
  // Only valid on ADVANCES links (feeds progress roll-up in a later phase).
  weight?: number;
}
