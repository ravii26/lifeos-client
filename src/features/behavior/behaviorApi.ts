import { useEffect } from "react";

import { api } from "@/store/api";

/**
 * Behavior events power the product's "silent intelligence" feed.
 * Fire CLIENT events (APP_OPEN, AREA_VIEWED, REVIEW_OPENED, VAULT_ACCESSED)
 * fire-and-forget. Do NOT fire TASK_COMPLETED / HABIT_LOGGED / FOCUS_* —
 * the server records those automatically from their own endpoints.
 */
export type BehaviorEvent =
  | "APP_OPEN"
  | "AREA_VIEWED"
  | "REVIEW_OPENED"
  | "VAULT_ACCESSED";

interface BehaviorPayload {
  eventType: BehaviorEvent;
  metadata?: Record<string, unknown>;
}

export const behaviorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    logBehavior: builder.mutation<unknown, BehaviorPayload>({
      query: (body) => ({ url: "/behavior", method: "POST", data: body }),
      // No tags: nothing in the UI depends on this; it's write-only telemetry.
    }),
  }),
});

export const { useLogBehaviorMutation } = behaviorApi;

/**
 * Fire a behavior event once, when the component mounts. Failures are
 * swallowed — telemetry must never disrupt the UI.
 */
export function useLogBehaviorOnMount(
  eventType: BehaviorEvent,
  metadata?: Record<string, unknown>,
) {
  const [logBehavior] = useLogBehaviorMutation();
  useEffect(() => {
    logBehavior({ eventType, metadata });
    // Fire exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
