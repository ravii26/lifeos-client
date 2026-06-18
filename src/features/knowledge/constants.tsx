import {
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Headphones,
  BookMarked,
  MoreHorizontal,
  Lightbulb,
  Layers,
  Quote,
  AlignLeft,
  type LucideIcon,
} from "lucide-react";

import type {
  MasteryLevel,
  NoteType,
  ResourceStatus,
  ResourceType,
} from "./types";

export const MASTERY_LEVELS: {
  value: MasteryLevel;
  label: string;
  tone: string;
  bg: string;
  dot: string;
}[] = [
  { value: "BEGINNER", label: "Beginner", tone: "text-tx-3", bg: "bg-surface-3", dot: "bg-tx-4" },
  { value: "INTERMEDIATE", label: "Intermediate", tone: "text-primary", bg: "bg-primary/10", dot: "bg-primary" },
  { value: "ADVANCED", label: "Advanced", tone: "text-warn", bg: "bg-warn/10", dot: "bg-warn" },
  { value: "EXPERT", label: "Expert", tone: "text-ok", bg: "bg-ok/10", dot: "bg-ok" },
];

export const MASTERY_BY_VALUE = Object.fromEntries(
  MASTERY_LEVELS.map((m) => [m.value, m]),
) as Record<MasteryLevel, (typeof MASTERY_LEVELS)[number]>;

export const RESOURCE_TYPES: { value: ResourceType; label: string; icon: LucideIcon }[] = [
  { value: "BOOK", label: "Book", icon: BookOpen },
  { value: "COURSE", label: "Course", icon: GraduationCap },
  { value: "VIDEO", label: "Video", icon: Video },
  { value: "ARTICLE", label: "Article", icon: FileText },
  { value: "PODCAST", label: "Podcast", icon: Headphones },
  { value: "DOCUMENTATION", label: "Docs", icon: BookMarked },
  { value: "OTHER", label: "Other", icon: MoreHorizontal },
];

export const RESOURCE_TYPE_BY_VALUE = Object.fromEntries(
  RESOURCE_TYPES.map((t) => [t.value, t]),
) as Record<ResourceType, (typeof RESOURCE_TYPES)[number]>;

export const RESOURCE_STATUSES: {
  value: ResourceStatus;
  label: string;
  dot: string;
  tone: string;
  bg: string;
}[] = [
  {
    value: "NOT_STARTED",
    label: "Not started",
    dot: "bg-tx-4",
    tone: "text-tx-3",
    bg: "bg-surface-3",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    dot: "bg-warn",
    tone: "text-warn",
    bg: "bg-warn/10",
  },
  { value: "COMPLETED", label: "Completed", dot: "bg-ok", tone: "text-ok", bg: "bg-ok/10" },
];

export const RESOURCE_STATUS_BY_VALUE = Object.fromEntries(
  RESOURCE_STATUSES.map((s) => [s.value, s]),
) as Record<ResourceStatus, (typeof RESOURCE_STATUSES)[number]>;

export const NOTE_TYPES: {
  value: NoteType;
  label: string;
  icon: LucideIcon;
  tone: string;
  bg: string;
}[] = [
  { value: "CONCEPT", label: "Concept", icon: Layers, tone: "text-primary", bg: "bg-primary/10" },
  { value: "INSIGHT", label: "Insight", icon: Lightbulb, tone: "text-acc", bg: "bg-acc/10" },
  { value: "SUMMARY", label: "Summary", icon: AlignLeft, tone: "text-ok", bg: "bg-ok/10" },
  { value: "QUOTE", label: "Quote", icon: Quote, tone: "text-warn", bg: "bg-warn/10" },
  { value: "OTHER", label: "Other", icon: MoreHorizontal, tone: "text-tx-3", bg: "bg-surface-3" },
];

export const NOTE_TYPE_BY_VALUE = Object.fromEntries(
  NOTE_TYPES.map((t) => [t.value, t]),
) as Record<NoteType, (typeof NOTE_TYPES)[number]>;
