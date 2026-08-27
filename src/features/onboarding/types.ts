export type OnboardingAreaType = "PRIMARY" | "MAINTENANCE";
export type OnboardingActionType = "GOAL" | "HABIT" | "TASK";

export interface OnboardingArea {
  name: string;
  type: OnboardingAreaType;
  icon: string;
  color: string;
}

export interface OnboardingAction {
  itemType: OnboardingActionType;
  title: string;
  detail?: string;
  areaName: string;
  frequency?: "DAILY" | "WEEKLY" | "CUSTOM";
  targetMinutes?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
}

export interface OnboardingExtraction {
  areas: OnboardingArea[];
  actions: OnboardingAction[];
}
