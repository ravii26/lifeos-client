import type { Priority } from "@/features/tasks/types";

// Goal and Project share the same status enum.
export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "ABANDONED";
export type ProjectStatus = GoalStatus;

export interface Goal {
  id: string;
  title: string;
  areaId: string;
  description?: string | null;
  priority?: Priority | null;
  status: GoalStatus;
  deadline?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
