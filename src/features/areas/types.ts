export type AreaType = "PRIMARY" | "MAINTENANCE";

/** A life domain (Health, Career…). Everything else hangs off areas. */
export interface Area {
  id: string;
  name: string;
  type: AreaType;
  color: string;
  icon: string;
  order: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaRequest {
  name: string;
  color: string;
  icon: string;
  type?: AreaType;
  order?: number;
  isActive?: boolean;
}

export type UpdateAreaRequest = Partial<CreateAreaRequest>;
