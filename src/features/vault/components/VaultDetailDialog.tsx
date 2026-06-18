import { useEffect } from "react";
import { ExternalLink, Heart, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { confirm } from "@/components/ui/confirm";

import { useDeleteVaultMutation, useMarkVaultUsedMutation } from "../vaultApi";
import { MEDIA_TYPE_BY_VALUE, VAULT_TYPE_BY_VALUE } from "../constants";
import type { VaultItem } from "../types";

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VaultDetailDialog({
  item,
  onClose,
}: {
  item: VaultItem;
  onClose: () => void;
}) {
  const [deleteVault, { isLoading: deleting }] = useDeleteVaultMutation();
  const [markUsed, { isLoading: pulling }] = useMarkVaultUsedMutation();
  const meta = VAULT_TYPE_BY_VALUE[item.vaultType];
  const media = item.mediaType ? MEDIA_TYPE_BY_VALUE[item.mediaType] : null;
  const MediaIcon = media?.icon;
  const added = formatDate(item.createdAt);
  const isQuote = item.mediaType === "QUOTE";

  // Close on Escape, and lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handlePull = async () => {
    try {
      await markUsed(item.id).unwrap();
      toast(`"${item.title}" pulled from vault`, { icon: "✨" });
    } catch {
      toast.error("Couldn't pull that item. Try again.");
    }
  };

  const handleDelete = async () => {
    if (!(await confirm({
      title: `Remove "${item.title}" from your vault?`,
      confirmText: "Remove",
      danger: true,
    }))) return;
    try {
      await deleteVault(item.id).unwrap();
      toast(`"${item.title}" removed from vault`);
      onClose();
    } catch {
      toast.error("Couldn't delete that item. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="rise relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-line-2 bg-surface-1 shadow-2xl"
      >
        {/* accent header band */}
        <div
          className="h-1 w-full"
          style={{ background: meta.accent }}
          aria-hidden
        />

        <div className="max-h-[calc(80vh-4px)] overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="chip border-transparent"
                style={{ color: meta.accent, background: `${meta.accent}1a` }}
              >
                <meta.icon className="size-3" />
                {meta.label}
              </span>
              {MediaIcon && media && (
                <span className="chip">
                  <MediaIcon className="size-3" />
                  {media.label}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="icon-btn"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <h2 className="mb-4 text-xl font-[680] leading-tight tracking-tight text-tx">
            {item.title}
          </h2>

          {isQuote ? (
            <blockquote
              className="mb-5 border-l-[3px] pl-4 text-[15px] leading-relaxed whitespace-pre-wrap text-tx-2 italic"
              style={{ borderColor: meta.accent }}
            >
              {item.content}
            </blockquote>
          ) : (
            <p className="mb-5 text-[14.5px] leading-[1.75] whitespace-pre-wrap text-tx-2">
              {item.content}
            </p>
          )}

          {(item.triggerTags ?? []).length > 0 && (
            <div className="mb-5">
              <div className="field-label mb-2">Trigger tags</div>
              <div className="flex flex-wrap gap-1.5">
                {(item.triggerTags ?? []).map((t) => (
                  <span key={t} className="chip text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mb-5 flex items-center gap-2 truncate rounded-lg border border-line bg-inset px-3 py-2.5 text-[13px] text-tx-2 transition hover:border-line-2 hover:text-tx"
            >
              <ExternalLink className="size-3.5 shrink-0 text-tx-3" />
              <span className="truncate">{item.url}</span>
            </a>
          )}

          {/* meta stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[12px] text-tx-3">
            {added && <span>Added {added}</span>}
            {item.usedCount != null && (
              <span className="font-mono text-tx-4">
                Pulled {item.usedCount}×
              </span>
            )}
            {item.helpfulCount != null && item.helpfulCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="size-3" /> {item.helpfulCount} found helpful
              </span>
            )}
          </div>

          {/* actions */}
          <div className="mt-6 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ds-btn ghost text-danger hover:text-danger disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              {deleting ? "Removing…" : "Remove"}
            </button>
            <button
              type="button"
              onClick={handlePull}
              disabled={pulling}
              className="ds-btn acc disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              {pulling ? "Pulling…" : "Pull from vault"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
