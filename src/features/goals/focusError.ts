import type { ApiError } from "@/lib/api/axiosBaseQuery";
import type { FocusError } from "./types";

/**
 * Focus-cap failures (409) put a structured object in `errors` instead of the
 * usual field→messages map. Pull it out (typed) when present, else null.
 */
export function getFocusError(error: unknown): FocusError | null {
  const errors = (error as ApiError | undefined)?.errors as unknown;
  if (
    errors &&
    typeof errors === "object" &&
    "reason" in errors &&
    ((errors as FocusError).reason === "MAX_ACTIVE_GOALS_REACHED" ||
      (errors as FocusError).reason === "PARK_TARGET_NOT_ACTIVE")
  ) {
    return errors as FocusError;
  }
  return null;
}
