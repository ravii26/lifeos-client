export type MasteryLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type ResourceType =
  | "BOOK"
  | "COURSE"
  | "VIDEO"
  | "ARTICLE"
  | "PODCAST"
  | "DOCUMENTATION"
  | "OTHER";

export type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type NoteType = "CONCEPT" | "INSIGHT" | "SUMMARY" | "QUOTE" | "OTHER";

export interface Topic {
  id: string;
  title: string;
  areaId: string;
  description?: string | null;
  masteryLevel?: MasteryLevel | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notebook {
  id: string;
  title: string;
  topicId: string;
  description?: string | null;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  title: string;
  topicId: string;
  resourceType: ResourceType;
  url?: string | null;
  platform?: string | null;
  status?: ResourceStatus | null;
  rating?: number | null;
  notes?: string | null;
  // B8 progress fields
  lessonsCompleted?: number | null;
  totalLessons?: number | null;
  minutesConsumed?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateResourceProgressRequest {
  lessonsCompleted?: number;
  totalLessons?: number;
  minutesConsumed?: number;
  autoComplete?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  topicId: string;
  notebookId?: string | null;
  resourceId?: string | null;
  noteType?: NoteType | null;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTopicRequest {
  title: string;
  areaId: string;
  description?: string;
  masteryLevel?: MasteryLevel;
}
export type UpdateTopicRequest = Partial<CreateTopicRequest>;

export interface CreateNotebookRequest {
  title: string;
  topicId: string;
  description?: string;
  tags?: string[];
}
export type UpdateNotebookRequest = Partial<CreateNotebookRequest>;

export interface CreateResourceRequest {
  title: string;
  topicId: string;
  resourceType: ResourceType;
  url?: string;
  platform?: string;
  status?: ResourceStatus;
  rating?: number;
  notes?: string;
}
export type UpdateResourceRequest = Partial<CreateResourceRequest>;

export interface CreateNoteRequest {
  title: string;
  content: string;
  topicId: string;
  notebookId?: string;
  resourceId?: string;
  noteType?: NoteType;
  tags?: string[];
}
export type UpdateNoteRequest = Partial<CreateNoteRequest>;
