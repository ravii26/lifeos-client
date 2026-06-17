import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Stat } from "@/components/ui/Stat";
import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";

import { useListVaultQuery } from "../vaultApi";
import { VAULT_TYPES } from "../constants";
import { VaultCard } from "../components/VaultCard";
import { NewVaultForm } from "../components/NewVaultForm";
import type { VaultType } from "../types";

export function VaultPage() {
  const [filter, setFilter] = useState<VaultType | "">("");
  const {
    data: items,
    isLoading,
    isError,
  } = useListVaultQuery(filter ? { vaultType: filter } : undefined);
  const [showForm, setShowForm] = useState(false);
  useLogBehaviorOnMount("VAULT_ACCESSED");

  const all = items ?? [];
  const timesPulled = all.reduce((s, v) => s + (v.usedCount ?? 0), 0);
  const recovery = all.filter((v) => v.vaultType === "RECOVERY").length;
  const categories = new Set(all.map((v) => v.vaultType)).size;

  const stats = [
    { num: all.length, label: "Total items" },
    { num: timesPulled, label: "Times pulled", color: "var(--acc)" },
    { num: recovery, label: "Recovery items" },
    { num: categories, label: "Categories" },
  ];

  return (
    <div className="page rise">
      <div className="page-head flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Support · sanctuary</div>
          <h1 className="page-title">Vault</h1>
          <div className="page-sub">
            Your personal strength system. Pull from it on low-energy days.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ds-btn ghost"
        >
          <Plus className="size-3.5" /> Add item
        </button>
      </div>

      <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
        {stats.map((x) => (
          <div key={x.label} className="card card-pad">
            <Stat num={x.num} label={x.label} color={x.color} />
          </div>
        ))}
      </div>

      <div className="mb-[var(--gap)] flex flex-wrap gap-1.5">
        <button
          type="button"
          className={cn("tag-toggle", filter === "" && "on")}
          onClick={() => setFilter("")}
        >
          All
        </button>
        {VAULT_TYPES.map((v) => (
          <button
            key={v.value}
            type="button"
            className={cn("tag-toggle", filter === v.value && "on")}
            onClick={() => setFilter(v.value)}
            style={
              filter === v.value
                ? { background: v.accent, borderColor: "transparent", color: "#0a0b0d" }
                : undefined
            }
          >
            {v.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewVaultForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading vault…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your vault. Is the backend running?
        </p>
      )}

      {all.length > 0 && (
        <div className="grid gap-[var(--gap)] sm:grid-cols-2 lg:grid-cols-3">
          {all.map((item) => (
            <VaultCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {items && all.length === 0 && !showForm && (
        <div className="card card-pad empty">
          {filter
            ? "Nothing here yet for this type."
            : "Your vault is empty — save what you'll want to revisit on the hard days."}
        </div>
      )}
    </div>
  );
}
