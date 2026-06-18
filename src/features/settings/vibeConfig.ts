import type { Vibe } from "./types";

/**
 * VibeConfig is the single source of truth for how each vibe curates the UI.
 *
 * The philosophy:
 *  - calm      → subtraction. Strip counts, badges, warnings, rankings. Show one
 *                next step; collapse the rest. The app should not generate anxiety.
 *  - focused   → the neutral baseline (everything on, nothing amplified).
 *  - energetic → amplification. Surface everything, rank it, gamify it.
 *
 * Components read flags from here instead of comparing vibe strings inline, so a
 * new rule is one line in this file rather than a conditional scattered across
 * the feature tree.
 */
export interface VibeConfig {
  /** Max suggestions rendered in the WhatNow decision card. */
  maxSuggestions: number;
  /** Urgency pills (HIGH/MEDIUM/LOW) on suggestions. */
  showUrgency: boolean;
  /** Neglected-area / weakest-area warning callouts. */
  showAlerts: boolean;
  /** Habit streak flames and streak alert pills. */
  showStreaks: boolean;
  /** Stat-bar cards (done / remaining / overdue counts) on list pages. */
  showStatBadges: boolean;
  /** Sidebar open-task count badge. */
  showNavCounts: boolean;
  /** Cap on open tasks shown before a "show more" affordance (null = no cap). */
  taskLimit: number | null;
  /** Add weight/glow to high-signal elements (streaks, HIGH urgency). */
  emphasize: boolean;
  /** Pressure-laden hero copy ("weakest area is…"). */
  showPressureCopy: boolean;
}

export const VIBE_CONFIG: Record<Vibe, VibeConfig> = {
  calm: {
    maxSuggestions: 1,
    showUrgency: false,
    showAlerts: false,
    showStreaks: false,
    showStatBadges: false,
    showNavCounts: false,
    taskLimit: 3,
    emphasize: false,
    showPressureCopy: false,
  },
  focused: {
    maxSuggestions: 5,
    showUrgency: true,
    showAlerts: true,
    showStreaks: true,
    showStatBadges: true,
    showNavCounts: true,
    taskLimit: null,
    emphasize: false,
    showPressureCopy: true,
  },
  energetic: {
    maxSuggestions: 99,
    showUrgency: true,
    showAlerts: true,
    showStreaks: true,
    showStatBadges: true,
    showNavCounts: true,
    taskLimit: null,
    emphasize: true,
    showPressureCopy: true,
  },
};
