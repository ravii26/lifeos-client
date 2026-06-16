import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiError } from "./axiosBaseQuery";

export type FieldErrorMap = Record<string, string>;

/**
 * Normalise the backend's 422 error shape.
 * `errors` is a map of field → string[]; we take the first message per field.
 * If there are no field errors (e.g. 401/409), we surface the top-level
 * `message` instead.
 */
export function parseApiErrors(error: ApiError): {
  fields: FieldErrorMap;
  message: string | null;
} {
  const fields: FieldErrorMap = {};
  if (error.errors) {
    for (const [key, messages] of Object.entries(error.errors)) {
      fields[key] = Array.isArray(messages) ? messages[0] : String(messages);
    }
  }
  const message =
    Object.keys(fields).length === 0
      ? (error.message ?? "Something went wrong")
      : null;
  return { fields, message };
}

/**
 * react-hook-form variant: maps field errors onto their inputs, or sets a
 * single `root` error when the failure isn't field-specific.
 */
export function applyApiErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
) {
  const { fields, message } = parseApiErrors(error);
  const entries = Object.entries(fields);
  if (entries.length > 0) {
    for (const [field, msg] of entries) {
      setError(field as Path<T>, { message: msg });
    }
  } else {
    setError("root", { message: message ?? "Something went wrong" });
  }
}
