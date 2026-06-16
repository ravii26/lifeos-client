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
}[] = [
  { value: "BEGINNER", label: "Beginner", tone: "text-tx-3" },
  { value: "INTERMEDIATE", label: "Intermediate", tone: "text-primary" },
  { value: "ADVANCED", label: "Advanced", tone: "text-warn" },
  { value: "EXPERT", label: "Expert", tone: "text-ok" },
];

export const MASTERY_BY_VALUE = Object.fromEntries(
  MASTERY_LEVELS.map((m) => [m.value, m]),
) as Record<MasteryLevel, (typeof MASTERY_LEVELS)[number]>;

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "BOOK", label: "Book" },
  { value: "COURSE", label: "Course" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Article" },
  { value: "PODCAST", label: "Podcast" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "OTHER", label: "Other" },
];

export const RESOURCE_STATUSES: {
  value: ResourceStatus;
  label: string;
  dot: string;
  tone: string;
}[] = [
  {
    value: "NOT_STARTED",
    label: "Not started",
    dot: "bg-tx-4",
    tone: "text-tx-3",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    dot: "bg-warn",
    tone: "text-warn",
  },
  { value: "COMPLETED", label: "Completed", dot: "bg-ok", tone: "text-ok" },
];

export const RESOURCE_STATUS_BY_VALUE = Object.fromEntries(
  RESOURCE_STATUSES.map((s) => [s.value, s]),
) as Record<ResourceStatus, (typeof RESOURCE_STATUSES)[number]>;

export const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: "CONCEPT", label: "Concept" },
  { value: "INSIGHT", label: "Insight" },
  { value: "SUMMARY", label: "Summary" },
  { value: "QUOTE", label: "Quote" },
  { value: "OTHER", label: "Other" },
];
