import { z } from "zod";

/**
 * Validate the environment at startup — same idea as the backend's env
 * validation. If VITE_API_BASE_URL is missing or malformed, we fail loudly
 * here instead of producing confusing network errors deep in the app.
 *
 * Only VITE_-prefixed variables are exposed by Vite on `import.meta.env`.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration — check your .env file.");
}

export const env = parsed.data;
