import { useState } from "react";
import { ExternalLink, Heart, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { confirm } from "@/components/ui/confirm";
import { timeAgo } from "@/lib/date";
import {
  useDeleteVaultMutation,
  useMarkVaultHelpfulMutation,
  useMarkVaultUsedMutation,
} from "../vaultApi";
import { MEDIA_TYPE_BY_VALUE, VAULT_TYPE_BY_VALUE } from "../constants";
import type { VaultItem } from "../types";
import { VaultDetailDialog } from "./VaultDetailDialog";

export function VaultCard({
  item,
  onEdit,
}: {
  item: VaultItem;
  /** Opens the edit form for this item (the page owns the form). */
  onEdit?: (item: VaultItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleteVault, { isLoading: deleting }] = useDeleteVaultMutation();
  const [markUsed, { isLoading: pulling }] = useMarkVaultUsedMutation();
  const [markHelpful, { isLoading: helping }] = useMarkVaultHelpfulMutation();
  const meta = VAULT_TYPE_BY_VALUE[item.vaultType];
  const media = item.mediaType ? MEDIA_TYPE_BY_VALUE[item.mediaType] : null;
  const MediaIcon = media?.icon;
  const added = timeAgo(item.createdAt);

  const handlePull = async () => {
    try {
      await markUsed(item.id).unwrap();
      toast(`"${item.title}" pulled from vault`);
    } catch {
      toast.error("Couldn't pull that item. Try again.");
    }
  };

  const handleHelped = async () => {
    try {
      await markHelpful(item.id).unwrap();
      toast(`Glad "${item.title}" helped`);
    } catch {
      toast.error("Couldn't record that. Try again.");
    }
  };

  const handleDelete = async () => {
    if (!(await confirm({
      title: `Delete "${item.title}"?`,
      confirmText: "Delete",
      danger: true,
    }))) return;
    try {
      await deleteVault(item.id).unwrap();
      toast(`"${item.title}" removed from vault`);
    } catch {
      toast.error("Couldn't delete that item. Try again.");
    }
  };

  // Stop the card's open-on-click when an inner control is used.
  const stop =
    (fn?: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      fn?.();
    };

  return (
    <>
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
      }}
      aria-label={`Open "${item.title}"`}
      className="card card-pad group relative flex cursor-pointer flex-col overflow-hidden transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-line"
      style={{ borderLeft: `5px solid ${meta.accent}` }}
    >
      <div className="relative mb-2.5 flex items-center justify-between gap-2">
        <span
          className="chip border-transparent"
          style={{ color: meta.accent, background: `${meta.accent}1a` }}
        >
          <meta.icon className="size-3" />
          {meta.label}
        </span>
        <div className="flex items-center gap-2.5">
          {MediaIcon && (
            <span
              className="flex items-center gap-1 text-[10px] text-tx-4"
              title={media?.label}
            >
              <MediaIcon className="size-3" />
            </span>
          )}
          {item.usedCount != null && item.usedCount > 0 && (
            <span className="font-mono text-[10px] text-tx-4">
              pulled {item.usedCount}×
            </span>
          )}
          <button
            type="button"
            onClick={stop(handleDelete)}
            disabled={deleting}
            title="Delete"
            aria-label="Delete item"
            className="text-tx-4 opacity-0 transition hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="relative mb-1.5 text-[14.5px] font-[650] leading-snug">
        {item.title}
      </div>
      <p className="relative m-0 mb-3.5 flex-1 text-[13px] leading-relaxed whitespace-pre-wrap text-tx-2">
        {item.content}
      </p>

      {(item.triggerTags ?? []).length > 0 && (
        <div className="relative mb-3 flex flex-wrap gap-1.5">
          {(item.triggerTags ?? []).map((t) => (
            <span key={t} className="chip text-[10px]">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2.5 text-tx-4">
          {added && <span className="text-[11px]">{added}</span>}
          {item.helpfulCount != null && item.helpfulCount > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <Heart className="size-3" /> {item.helpfulCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="icon-btn !h-7 !w-7"
              title="Open link"
              aria-label="Open link"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={stop(handleHelped)}
            disabled={helping}
            title="This helped me"
            aria-label="Mark as helpful"
            className="ds-btn sm gap-1.5 transition group-hover:border-line-3 disabled:opacity-50"
          >
            <Heart className="size-3.5" style={{ color: meta.accent }} />
            {helping ? "…" : "Helped"}
          </button>
          <button
            type="button"
            onClick={stop(handlePull)}
            disabled={pulling}
            title="Pull from vault"
            className="ds-btn sm gap-1.5 transition group-hover:border-line-3 disabled:opacity-50"
          >
            <Sparkles className="size-3.5" style={{ color: meta.accent }} />
            {pulling ? "Pulling…" : "Pull"}
          </button>
        </div>
      </div>
    </div>

    {open && (
      <VaultDetailDialog
        item={item}
        onClose={() => setOpen(false)}
        onEdit={onEdit}
      />
    )}
    </>
  );
}
