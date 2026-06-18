import { useState } from "react";
import { Check, Plus } from "lucide-react";

import { Stat } from "@/components/ui/Stat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListAreasQuery } from "@/features/areas/areasApi";
import { useVibeConfig } from "@/features/settings/useVibe";

import {
  useCompleteTaskMutation,
  useCreateTaskMutation,
  useListTasksQuery,
} from "../tasksApi";
import { NewTaskForm } from "../components/NewTaskForm";
import { TaskRow } from "../components/TaskRow";

const PRIORITY_RANK: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function TasksPage() {
  const { data: tasks, isLoading, isError } = useListTasksQuery();
  const { data: areas } = useListAreasQuery();
  const cfg = useVibeConfig();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftArea, setDraftArea] = useState("");
  const [createTask] = useCreateTaskMutation();
  const [completeTask] = useCompleteTaskMutation();

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const open = (tasks ?? []).filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  );
  const done = (tasks ?? []).filter((t) => t.status === "COMPLETED");
  const total = open.length + done.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;

  const highPriority = open.filter(
    (t) => t.priority === "HIGH" || t.priority === "CRITICAL",
  );
  const now = new Date().getTime();
  const overdue = open.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now,
  );

  // Top-priority spotlight = the most urgent open task.
  const top = [...open].sort(
    (a, b) =>
      (PRIORITY_RANK[a.priority ?? "MEDIUM"] ?? 2) -
      (PRIORITY_RANK[b.priority ?? "MEDIUM"] ?? 2),
  )[0];
  const topArea = top?.areaId ? areaById.get(top.areaId) : undefined;

  const quickAdd = () => {
    if (!draft.trim()) return;
    createTask({ title: draft.trim(), ...(draftArea ? { areaId: draftArea } : {}) });
    setDraft("");
  };

  const stats = [
    { num: done.length, label: "Done today", color: "var(--ok)" },
    { num: open.length, label: "Remaining", color: "var(--tx)" },
    { num: highPriority.length, label: "High priority", color: "var(--warn)" },
    { num: overdue.length, label: "Overdue", color: "var(--danger)" },
  ];

  return (
    <div className="page rise">
      <div className="mb-[var(--gap)] flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Execution</div>
          <h1 className="page-title">Tasks</h1>
          <div className="page-sub">
            {done.length}/{total} done · {pct}% complete
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ds-btn ghost"
        >
          <Plus className="size-3.5" /> New task
        </button>
      </div>

      {/* Stat row — hidden on calm to drop the count pressure */}
      {cfg.showStatBadges && (
        <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
          {stats.map((x) => (
            <div key={x.label} className="card card-pad">
              <Stat num={x.num} label={x.label} color={x.color} />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewTaskForm areas={areas ?? []} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Top priority spotlight */}
      {top && (
        <div className="card raised card-pad relative mb-[var(--gap)] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 0 0, var(--acc-soft), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="eyebrow mb-2 text-primary">★ Top priority</div>
            <div className="h-display mb-3.5 text-[19px]">{top.title}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => completeTask(top.id)}
                className="ds-btn acc sm"
              >
                <Check className="size-3" /> Mark done
              </button>
              {topArea && (
                <span className="ml-auto flex items-center gap-1.5 text-[13px] text-tx-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: topArea.color }}
                  />
                  {topArea.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading tasks…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your tasks. Is the backend running?
        </p>
      )}

      {/* Lanes */}
      <div className="grid gap-[var(--gap)] lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="card card-pad">
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Lane</div>
              <div className="card-title mt-0.5 text-[15px]">To do</div>
            </div>
            <span className="chip font-mono">{open.length}</span>
          </div>

          <div className="mb-3.5 flex gap-2">
            <input
              className="ds-input flex-1"
              placeholder="Add a task…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && quickAdd()}
            />
            <Select value={draftArea} onValueChange={setDraftArea}>
              <SelectTrigger className="h-9 w-[130px] text-sm">
                <SelectValue placeholder="No area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No area</SelectItem>
                {(areas ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button type="button" onClick={quickAdd} className="ds-btn acc">
              <Plus className="size-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {open.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                area={t.areaId ? areaById.get(t.areaId) : undefined}
              />
            ))}
            {open.length === 0 && (
              <div className="empty">Nothing to do — nice work.</div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Lane</div>
              <div className="card-title mt-0.5 text-[15px]">Completed</div>
            </div>
            <span className="chip font-mono">{done.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {done.slice(0, 12).map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                area={t.areaId ? areaById.get(t.areaId) : undefined}
              />
            ))}
            {done.length === 0 && (
              <div className="empty">No wins logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
