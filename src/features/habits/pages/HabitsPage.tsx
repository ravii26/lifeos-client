import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListHabitsQuery } from "../habitsApi";
import { HabitCard } from "../components/HabitCard";
import { NewHabitForm } from "../components/NewHabitForm";

export function HabitsPage() {
  const { data: habits, isLoading, isError } = useListHabitsQuery();
  const { data: areas } = useListAreasQuery();
  const [showForm, setShowForm] = useState(false);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const active = (habits ?? []).filter((h) => h.isActive);
  const inactive = (habits ?? []).filter((h) => !h.isActive);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Execution
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="mt-1 text-sm text-tx-3">
            The repeatable actions that compound.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New habit
        </Button>
      </div>

      {showForm && (
        <NewHabitForm areas={areas ?? []} onClose={() => setShowForm(false)} />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading habits…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your habits. Is the backend running?
        </p>
      )}

      {habits && habits.length === 0 && !showForm && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No habits yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Build your first routine to start a streak.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Create your first habit
          </Button>
        </div>
      )}

      {active.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              area={habit.areaId ? areaById.get(habit.areaId) : undefined}
            />
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Inactive · {inactive.length}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactive.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                area={habit.areaId ? areaById.get(habit.areaId) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
