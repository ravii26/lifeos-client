/** The authenticated user, as returned by the backend (no passwordHash). */
export interface User {
  id: string;
  email: string;
  name: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Register/login both return the user plus a JWT. */
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone?: string;
}

/** GET /auth/stats — lifetime momentum numbers (B10). */
export interface ProfileStats {
  joinedAt: string;
  tasksDone: number;
  habitsLogged: number;
  focusHours: number;
}
