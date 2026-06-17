import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListGoalsQuery } from "../goalsApi";
import { GoalCard } from "../components/GoalCard";
import { NewGoalForm } from "../components/NewGoalForm";

export function GoalsPage() {
  const { data: areas } = useListAreasQuery();
  const [areaFilter, setAreaFilter] = useState("");
  const {
    data: goals,
    isLoading,
    isError,
  } = useListGoalsQuery(areaFilter ? { areaId: areaFilter } : undefined);
  const [showForm, setShowForm] = useState(false);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const hasAreas = (areas ?? []).length > 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Insights · direction
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-tx-3">
            The outcomes your projects and tasks ladder up to.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} disabled={!hasAreas}>
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      {!hasAreas && (
        <p className="mt-6 rounded-lg border border-line-2 bg-surface-2 p-4 text-sm text-tx-3">
          Create a life area first — goals must belong to one.
        </p>
      )}

      {hasAreas && (areas?.length ?? 0) > 1 && (
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs text-tx-3">Area</span>
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="h-8 w-[140px] text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {areas?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showForm && (
        <NewGoalForm areas={areas ?? []} onClose={() => setShowForm(false)} />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading goals…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your goals. Is the backend running?
        </p>
      )}

      {goals && goals.length === 0 && !showForm && hasAreas && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No goals yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Set a goal to give your projects a direction.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Create your first goal
          </Button>
        </div>
      )}

      {goals && goals.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              area={areaById.get(goal.areaId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
