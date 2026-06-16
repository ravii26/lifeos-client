import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Support · the vault
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Vault</h1>
          <p className="mt-1 text-sm text-tx-3">
            Reflections, memories, and fuel for when you need them.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New entry
        </Button>
      </div>

      {/* Type filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={filter === ""} onClick={() => setFilter("")}>
          All
        </FilterChip>
        {VAULT_TYPES.map((v) => (
          <FilterChip
            key={v.value}
            active={filter === v.value}
            accent={v.accent}
            onClick={() => setFilter(v.value)}
          >
            {v.label}
          </FilterChip>
        ))}
      </div>

      {showForm && <NewVaultForm onClose={() => setShowForm(false)} />}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading vault…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your vault. Is the backend running?
        </p>
      )}

      {items && items.length === 0 && !showForm && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">
            {filter ? "Nothing here yet for this type." : "Your vault is empty."}
          </p>
          <p className="mt-1 text-sm text-tx-3">
            Save the things you'll want to revisit on the hard days.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Add your first entry
          </Button>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <VaultCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-surface-3 text-tx"
          : "border-line-2 text-tx-3 hover:text-tx",
      )}
      style={active && accent ? { color: accent } : undefined}
    >
      {children}
    </button>
  );
}
