import { ExternalLink, Heart, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDeleteVaultMutation, useMarkVaultUsedMutation } from "../vaultApi";
import { VAULT_TYPE_BY_VALUE } from "../constants";
import type { VaultItem } from "../types";

export function VaultCard({ item }: { item: VaultItem }) {
  const [deleteVault, { isLoading: deleting }] = useDeleteVaultMutation();
  const [markUsed, { isLoading: pulling }] = useMarkVaultUsedMutation();
  const meta = VAULT_TYPE_BY_VALUE[item.vaultType];

  return (
    <div
      className="card card-pad group flex flex-col overflow-hidden"
      style={{ borderLeft: `3px solid ${meta.accent}` }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className="chip border-transparent"
          style={{ color: meta.accent, background: `${meta.accent}1a` }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          {item.usedCount != null && (
            <span className="font-mono text-[10px] text-tx-4">
              used {item.usedCount}×
            </span>
          )}
          <button
            type="button"
            onClick={() => deleteVault(item.id)}
            disabled={deleting}
            title="Delete"
            className="text-tx-4 opacity-0 transition hover:text-danger group-hover:opacity-100 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-1.5 text-[14.5px] font-[650]">{item.title}</div>
      <p className="m-0 mb-3.5 flex-1 text-[13px] leading-relaxed whitespace-pre-wrap text-tx-2">
        {item.content}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(item.triggerTags ?? []).map((t) => (
            <span key={t} className="chip text-[10px]">
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-tx-4">
          {item.helpfulCount != null && (
            <span className="flex items-center gap-1 text-[11px]">
              <Heart className="size-3" /> {item.helpfulCount}
            </span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
              title="Open"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={async () => {
              await markUsed(item.id);
              toast(`"${item.title}" pulled from vault`, { icon: "✨" });
            }}
            disabled={pulling}
            title="Pull from vault"
            className="flex items-center gap-1 text-[11px] hover:text-tx disabled:opacity-50"
          >
            <Sparkles className="size-3" />
            Pull
          </button>
        </div>
      </div>
    </div>
  );
}
