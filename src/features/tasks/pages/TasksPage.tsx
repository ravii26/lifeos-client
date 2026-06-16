import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListTasksQuery } from "../tasksApi";
import { NewTaskForm } from "../components/NewTaskForm";
import { TaskRow } from "../components/TaskRow";

export function TasksPage() {
  const { data: tasks, isLoading, isError } = useListTasksQuery();
  const { data: areas } = useListAreasQuery();
  const [showForm, setShowForm] = useState(false);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const open = (tasks ?? []).filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  );
  const done = (tasks ?? []).filter((t) => t.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Execution
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-tx-3">Your daily execution lane.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      {showForm && (
        <NewTaskForm areas={areas ?? []} onClose={() => setShowForm(false)} />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading tasks…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your tasks. Is the backend running?
        </p>
      )}

      {tasks && tasks.length === 0 && !showForm && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No tasks yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Add your first task to start executing.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Add your first task
          </Button>
        </div>
      )}

      {open.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            To do · {open.length}
          </div>
          <div className="space-y-2">
            {open.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                area={task.areaId ? areaById.get(task.areaId) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Completed · {done.length}
          </div>
          <div className="space-y-2">
            {done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                area={task.areaId ? areaById.get(task.areaId) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
