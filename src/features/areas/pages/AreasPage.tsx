import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";

import { useListAreasQuery } from "../areasApi";
import { AreaCard } from "../components/AreaCard";
import { NewAreaForm } from "../components/NewAreaForm";

export function AreasPage() {
  const { data: areas, isLoading, isError } = useListAreasQuery();
  const [showForm, setShowForm] = useState(false);
  useLogBehaviorOnMount("AREA_VIEWED");

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Insights · balance
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Life Areas
          </h1>
          <p className="mt-1 text-sm text-tx-3">
            The domains everything else hangs off.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New area
        </Button>
      </div>

      {showForm && <NewAreaForm onClose={() => setShowForm(false)} />}

      {isLoading && (
        <p className="mt-8 text-sm text-tx-3">Loading areas…</p>
      )}

      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your areas. Is the backend running?
        </p>
      )}

      {areas && areas.length === 0 && !showForm && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No areas yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Create your first life domain to start organizing everything else.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Create your first area
          </Button>
        </div>
      )}

      {areas && areas.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      )}
    </div>
  );
}
