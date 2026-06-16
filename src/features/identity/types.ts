/** One identity record per user. `GET /identity` can return null. */
export interface Identity {
  id?: string;
  personality?: string | null;
  values?: string[] | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  purpose?: string | null;
  thisYearGoal?: string | null;
  bigPicture?: string | null;
  lifeVision?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** PUT /identity upserts the whole record — all fields optional. */
export interface UpdateIdentityRequest {
  personality?: string;
  values?: string[];
  strengths?: string[];
  weaknesses?: string[];
  purpose?: string;
  thisYearGoal?: string;
  bigPicture?: string;
  lifeVision?: string;
}
