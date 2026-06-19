import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { useListAreasQuery } from "@/features/areas/areasApi";

import {
  useActivateGoalMutation,
  useGetGoalBoardQuery,
  useListGoalsQuery,
} from "../goalsApi";
import { getFocusError } from "../focusError";
import { GoalCard } from "../components/GoalCard";
import { NewGoalForm } from "../components/NewGoalForm";
import type { Goal, MaxActiveGoalsError } from "../types";
import { ParkChooser } from "../components/ParkChooser";

export function GoalsPage() {
  const { data: areas } = useListAreasQuery();
  const {
    data: board,
    isLoading,
    isError,
  } = useGetGoalBoardQuery();
  // Active/parked live on the board; everything else (completed/paused/
  // abandoned) is surfaced from the plain list.
  const { data: allGoals } = useListGoalsQuery();
  const [activateGoal, { isLoading: activating }] = useActivateGoalMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  // When activating hits the cap, we stash the pending goal + active set here.
  const [parkPrompt, setParkPrompt] = useState<{
    goal: Goal;
    error: MaxActiveGoalsError;
  } | null>(null);

  const areaById = useMemo(
    () => new Map((areas ?? []).map((a) => [a.id, a])),
    [areas],
  );
  const hasAreas = (areas ?? []).length > 0;

  const archived = useMemo(
    () =>
      (allGoals ?? []).filter(
        (g) => g.status !== "ACTIVE" && g.status !== "PARKED",
      ),
    [allGoals],
  );

  const startEdit = (goal: Goal) => {
    setShowForm(false);
    setEditing(goal);
  };

  const runActivate = async (goal: Goal, parkGoalId?: string) => {
    try {
      await activateGoal({ id: goal.id, parkGoalId }).unwrap();
      setParkPrompt(null);
      toast.success(`Focusing on “${goal.title}”`);
    } catch (err) {
      const focus = getFocusError(err);
      if (focus?.reason === "MAX_ACTIVE_GOALS_REACHED") {
        setParkPrompt({ goal, error: focus });
        return;
      }
      if (focus?.reason === "PARK_TARGET_NOT_ACTIVE") {
        setParkPrompt(null);
        toast.error("That goal is no longer active — try again.");
        return;
      }
      toast.error((err as ApiError).message ?? "Couldn't activate goal");
    }
  };

  const active = board?.active ?? [];
  const parked = board?.parked ?? [];
  const slotsRemaining = board?.slotsRemaining ?? 0;
  const maxActive = board?.maxActive ?? 2;

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
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm((v) => !v);
          }}
          disabled={!hasAreas}
        >
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      {!hasAreas && (
        <p className="mt-6 rounded-lg border border-line-2 bg-surface-2 p-4 text-sm text-tx-3">
          Create a life area first — goals must belong to one.
        </p>
      )}

      {(showForm || editing) && (
        <NewGoalForm
          key={editing?.id ?? "new"}
          areas={areas ?? []}
          goal={editing ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading goals…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your goals. Is the backend running?
        </p>
      )}

      {board && (
        <>
          {/* Active focus set */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-tx-2">In focus</h2>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-tx-3">
                {active.length}/{maxActive} ·{" "}
                {slotsRemaining > 0
                  ? `${slotsRemaining} slot${slotsRemaining === 1 ? "" : "s"} open`
                  : "full"}
              </span>
            </div>
            {active.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line-2 p-8 text-center text-sm text-tx-3">
                Nothing in focus. Activate a goal from your backlog below.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {active.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    area={areaById.get(goal.areaId)}
                    onActivate={runActivate}
                    onEdit={startEdit}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Parked backlog */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-tx-2">
              Backlog
              <span className="ml-2 text-tx-4">{parked.length}</span>
            </h2>
            {parked.length === 0 ? (
              <p className="mt-4 text-sm text-tx-3">
                No parked goals.{" "}
                {hasAreas && "New goals start here until you activate them."}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {parked.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    area={areaById.get(goal.areaId)}
                    onActivate={runActivate}
                    onEdit={startEdit}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Completed / paused / abandoned */}
          {archived.length > 0 && (
            <section className="mt-8">
              <button
                type="button"
                onClick={() => setShowArchive((v) => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-tx-2 hover:text-tx"
              >
                Archive
                <span className="text-tx-4">{archived.length}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    showArchive && "rotate-180",
                  )}
                />
              </button>
              {showArchive && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {archived.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      area={areaById.get(goal.areaId)}
                      onActivate={runActivate}
                      onEdit={startEdit}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {active.length === 0 &&
            parked.length === 0 &&
            archived.length === 0 &&
            hasAreas &&
            !showForm && (
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
        </>
      )}

      {parkPrompt && (
        <ParkChooser
          activeGoals={parkPrompt.error.activeGoals}
          activatingTitle={parkPrompt.goal.title}
          maxActive={parkPrompt.error.maxActive}
          busy={activating}
          onChoose={(parkGoalId) => runActivate(parkPrompt.goal, parkGoalId)}
          onCancel={() => setParkPrompt(null)}
        />
      )}
    </div>
  );
}
