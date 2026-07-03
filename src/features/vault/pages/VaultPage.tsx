import { useState } from "react";
import { Plus, Shield, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Stat } from "@/components/ui/Stat";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";

import { useListVaultQuery } from "../vaultApi";
import { VAULT_TYPES } from "../constants";
import { VaultCard } from "../components/VaultCard";
import { NewVaultForm } from "../components/NewVaultForm";
import type { VaultItem, VaultType } from "../types";

export function VaultPage() {
  const [filter, setFilter] = useState<VaultType | "">("");
  const {
    data: items,
    isLoading,
    isError,
  } = useListVaultQuery(filter ? { vaultType: filter } : undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  useLogBehaviorOnMount("VAULT_ACCESSED");

  const startEdit = (item: VaultItem) => {
    setShowForm(false);
    setEditingItem(item);
  };

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
          onClick={() => {
            setEditingItem(null);
            setShowForm((v) => !v);
          }}
          className={cn("ds-btn", showForm ? "ghost" : "acc")}
        >
          {showForm ? (
            <>
              <X className="size-3.5" /> Close
            </>
          ) : (
            <>
              <Plus className="size-3.5" /> Add item
            </>
          )}
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
            className={cn("tag-toggle inline-flex items-center gap-1.5", filter === v.value && "on")}
            onClick={() => setFilter(v.value)}
            style={
              filter === v.value
                ? { background: v.accent, borderColor: "transparent", color: "#0a0b0d" }
                : undefined
            }
          >
            <v.icon className="size-3" />
            {v.label}
          </button>
        ))}
      </div>

      {(showForm || editingItem) && (
        <div className="mb-[var(--gap)]">
          <NewVaultForm
            key={editingItem?.id ?? "new"}
            item={editingItem ?? undefined}
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}

      {isLoading && <CardSkeleton />}

      {isError && (
        <div className="card card-pad empty !text-danger">
          Couldn't load your vault. Is the backend running?
        </div>
      )}

      {all.length > 0 && (
        <div className="grid gap-[var(--gap)] sm:grid-cols-2 lg:grid-cols-3">
          {all.map((item) => (
            <VaultCard key={item.id} item={item} onEdit={startEdit} />
          ))}
        </div>
      )}

      {items && all.length === 0 && !showForm && (
        <div className="card card-pad flex flex-col items-center gap-3 py-14 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-acc-soft text-acc">
            {filter ? <Sparkles className="size-5" /> : <Shield className="size-5" />}
          </div>
          <div className="max-w-sm text-sm text-tx-3">
            {filter
              ? "Nothing here yet for this type. Add something to pull from later."
              : "Your vault is empty — save what you'll want to revisit on the hard days."}
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="ds-btn acc mt-1"
          >
            <Plus className="size-3.5" /> Add your first item
          </button>
        </div>
      )}
    </div>
  );
}
