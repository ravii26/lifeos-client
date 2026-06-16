import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateVaultMutation } from "../vaultApi";
import { MEDIA_TYPES, VAULT_TYPES } from "../constants";
import type { MediaType, VaultType } from "../types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]";

/** Split a comma-separated tag string into a clean array. */
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function NewVaultForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [vaultType, setVaultType] = useState<VaultType>("MOTIVATION");
  const [mediaType, setMediaType] = useState<MediaType>("TEXT");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createVault, { isLoading }] = useCreateVaultMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setFieldErrors({});
    setFormError(null);
    const triggerTags = parseTags(tags);
    try {
      await createVault({
        title: title.trim(),
        content: content.trim(),
        vaultType,
        mediaType,
        ...(url.trim() ? { url: url.trim() } : {}),
        ...(triggerTags.length ? { triggerTags } : {}),
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
      className="mt-6 rounded-xl border border-line bg-surface-1 p-5"
    >
      <div className="space-y-2">
        <Label htmlFor="vault-title">Title</Label>
        <Input
          id="vault-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Why I started"
          aria-invalid={!!fieldErrors.title}
          autoFocus
        />
        {fieldErrors.title && (
          <p className="text-xs text-danger">{fieldErrors.title}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="vault-content">Content</Label>
        <textarea
          id="vault-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="The reflection, memory, quote, or reminder…"
          rows={4}
          aria-invalid={!!fieldErrors.content}
          className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-ring"
        />
        {fieldErrors.content && (
          <p className="text-xs text-danger">{fieldErrors.content}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vault-type">Type</Label>
          <select
            id="vault-type"
            value={vaultType}
            onChange={(e) => setVaultType(e.target.value as VaultType)}
            className={selectClass}
          >
            {VAULT_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label} — {v.hint}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vault-media">Media</Label>
          <select
            id="vault-media"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            className={selectClass}
          >
            {MEDIA_TYPES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vault-url">URL</Label>
          <Input
            id="vault-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… (optional)"
            aria-invalid={!!fieldErrors.url}
          />
          {fieldErrors.url && (
            <p className="text-xs text-danger">{fieldErrors.url}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vault-tags">Trigger tags</Label>
          <Input
            id="vault-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma, separated, tags"
          />
        </div>
      </div>

      {formError && <p className="mt-4 text-sm text-danger">{formError}</p>}

      <div className="mt-5 flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !title.trim() || !content.trim()}
        >
          {isLoading ? "Saving…" : "Save to vault"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
