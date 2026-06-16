import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateResourceMutation } from "../knowledgeApi";
import { RESOURCE_STATUSES, RESOURCE_TYPES } from "../constants";
import type { ResourceStatus, ResourceType } from "../types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

export function NewResourceForm({
  topicId,
  onClose,
}: {
  topicId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("ARTICLE");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState<ResourceStatus>("NOT_STARTED");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createResource, { isLoading }] = useCreateResourceMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setFieldErrors({});
    setFormError(null);
    try {
      await createResource({
        title: title.trim(),
        topicId,
        resourceType,
        status,
        ...(url.trim() ? { url: url.trim() } : {}),
        ...(platform.trim() ? { platform: platform.trim() } : {}),
      }).unwrap();
      onClose();
    } catch (err) {
      const { fields, message } = parseApiErrors(err as ApiError);
      setFieldErrors(fields);
      setFormError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-line-2 bg-surface-2 p-4"
    >
      <div className="space-y-2">
        <Label htmlFor="res-title">Title</Label>
        <Input
          id="res-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Designing Data-Intensive Applications"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="res-type">Type</Label>
          <select
            id="res-type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            className={selectClass}
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="res-status">Status</Label>
          <select
            id="res-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ResourceStatus)}
            className={selectClass}
          >
            {RESOURCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="res-url">URL</Label>
          <Input
            id="res-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            aria-invalid={!!fieldErrors.url}
          />
          {fieldErrors.url && (
            <p className="text-xs text-danger">{fieldErrors.url}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="res-platform">Platform</Label>
          <Input
            id="res-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. O'Reilly, YouTube"
          />
        </div>
      </div>

      {formError && <p className="mt-3 text-sm text-danger">{formError}</p>}

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" disabled={isLoading || !title.trim()}>
          {isLoading ? "Adding…" : "Add resource"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
