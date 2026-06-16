import { ExternalLink, Heart, Trash2 } from "lucide-react";

import { useDeleteVaultMutation } from "../vaultApi";
import { VAULT_TYPE_BY_VALUE } from "../constants";
import type { VaultItem } from "../types";

export function VaultCard({ item }: { item: VaultItem }) {
  const [deleteVault, { isLoading: deleting }] = useDeleteVaultMutation();
  const meta = VAULT_TYPE_BY_VALUE[item.vaultType];

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-line bg-surface-1 p-4 pl-5"
      style={{ borderLeftColor: meta.accent, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.13em]"
            style={{ color: meta.accent }}
          >
            {meta.label}
          </span>
          <div className="truncate text-sm font-semibold">{item.title}</div>
        </div>
        <button
          type="button"
          onClick={() => deleteVault(item.id)}
          disabled={deleting}
          title="Delete"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-tx-2">
        {item.content}
      </p>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" /> Open
        </a>
      )}

      {item.triggerTags && item.triggerTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.triggerTags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-tx-3"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {(item.usedCount != null || item.helpfulCount != null) && (
        <div className="mt-3 flex items-center gap-3 border-t border-line-2 pt-2.5 text-[11px] text-tx-4">
          {item.usedCount != null && <span>Used {item.usedCount}×</span>}
          {item.helpfulCount != null && (
            <span className="flex items-center gap-1">
              <Heart className="size-3" /> {item.helpfulCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
