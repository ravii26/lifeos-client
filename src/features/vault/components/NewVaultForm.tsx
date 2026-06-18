import { useState } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors, type FieldErrorMap } from "@/lib/api/formErrors";

import { useCreateVaultMutation } from "../vaultApi";
import { MEDIA_TYPES, VAULT_TYPES } from "../constants";
import type { MediaType, VaultType } from "../types";

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
      className="rounded-xl border border-line bg-surface-1 p-5"
    >
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="size-4 text-acc" />
        <h2 className="text-sm font-[650] text-tx">Add to your vault</h2>
      </div>

      <div className="mb-4 space-y-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VAULT_TYPES.map((v) => {
            const active = vaultType === v.value;
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => setVaultType(v.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition",
                  active
                    ? "bg-surface-2"
                    : "border-line bg-transparent hover:border-line-2 hover:bg-surface-2/50",
                )}
                style={
                  active
                    ? { borderColor: v.accent, boxShadow: `0 0 0 1px ${v.accent}` }
                    : undefined
                }
              >
                <v.icon
                  className="size-4"
                  style={{ color: active ? v.accent : "var(--tx-3)" }}
                />
                <span className="text-[13px] font-[600] text-tx">{v.label}</span>
                <span className="text-[11px] leading-tight text-tx-4">
                  {v.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
          <Label>Media</Label>
          <Select value={mediaType} onValueChange={(v) => setMediaType(v as MediaType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDIA_TYPES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  <m.icon className="size-3.5 text-tx-3" />
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
