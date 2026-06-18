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
  // Server-computed scoring (A2 — present when backend returns them).
  score?: number | null;
  tasksDone?: number | null;
  tasksTotal?: number | null;
  streak?: number | null;
  focusMins?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaScoreSnapshot {
  id: string;
  areaId: string;
  score: number;
  tasksDone: number;
  tasksTotal: number;
  streak: number;
  focusMins: number;
  createdAt: string;
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

export type TrendDirection = "UP" | "STABLE" | "DOWN";

export interface AreaTrend {
  areaId: string;
  areaName: string;
  currentScore: number | null;
  previousScore: number | null;
  delta: number | null;
  direction: TrendDirection;
  snapshotCount: number;
  weakness: string;
}

export interface AreaTrendsResult {
  trends: AreaTrend[];
  overallDirection: TrendDirection;
  generatedAt: string;
}
