import type { Priority } from "@/features/tasks/types";

// Goals can be parked (backlog) in addition to the shared lifecycle states.
// Projects keep the original enum — they have no "parked" concept.
export type GoalStatus =
  | "ACTIVE"
  | "PARKED"
  | "COMPLETED"
  | "PAUSED"
  | "ABANDONED";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "ABANDONED";

export type ConfidenceLabel = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
export type ConfidenceWeakest = "habits" | "tasks" | "momentum";

/** Confidence block — only present on `?withConfidence`, /board, /:id/confidence. */
export interface Confidence {
  confidence: number;
  label: ConfidenceLabel;
  drivers: {
    habitConsistency: number;
    taskCompletion: number;
    momentum: number;
  };
  weakest: ConfidenceWeakest;
  /** Integer days since last progress, or null if no progress ever. */
  daysSinceProgress: number | null;
}

export interface Goal {
  id: string;
  title: string;
  areaId: string;
  description?: string | null;
  priority?: Priority | null;
  status: GoalStatus;
  deadline?: string | null;
  /** Set when active, cleared otherwise. Additive — safe to ignore. */
  activatedAt?: string | null;
  /** Set when parked, cleared otherwise. */
  parkedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** A goal carrying its confidence block (confidence-aware endpoints). */
export type GoalWithConfidence = Goal & { confidence: Confidence };

/** GET /goals/board — the focus screen in one payload. */
export interface GoalBoard {
  active: GoalWithConfidence[];
  parked: GoalWithConfidence[];
  maxActive: number;
  /** 2 - active.length, min 0. */
  slotsRemaining: number;
}

/** Returned by /activate and /park. */
export interface FocusState {
  goal: Goal;
  activeGoals: Goal[];
  maxActive: number;
  slotsRemaining: number;
}

export interface Project {
  id: string;
  title: string;
  areaId: string;
  goalId?: string | null;
  description?: string | null;
  status: ProjectStatus;
  deadline?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalRequest {
  title: string;
  areaId: string;
  description?: string;
  priority?: Priority;
  status?: GoalStatus;
  deadline?: string;
}
export type UpdateGoalRequest = Partial<CreateGoalRequest>;

export interface CreateProjectRequest {
  title: string;
  areaId: string;
  goalId?: string;
  description?: string;
  status?: ProjectStatus;
  deadline?: string;
}
export type UpdateProjectRequest = Partial<CreateProjectRequest>;

/* ------------------------------------------------------------------ *
 * Focus-cap error payloads (409). These arrive in ApiError.errors as
 * a structured object rather than the usual field→messages map.
 * ------------------------------------------------------------------ */
export type FocusErrorReason =
  | "MAX_ACTIVE_GOALS_REACHED"
  | "PARK_TARGET_NOT_ACTIVE";

export interface MaxActiveGoalsError {
  reason: "MAX_ACTIVE_GOALS_REACHED";
  maxActive: number;
  activeGoals: Goal[];
}

export interface ParkTargetNotActiveError {
  reason: "PARK_TARGET_NOT_ACTIVE";
  parkGoalId: string;
}

export type FocusError = MaxActiveGoalsError | ParkTargetNotActiveError;
