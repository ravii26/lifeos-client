import { createElement } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Donut } from "@/components/charts/Donut";
import { confirm } from "@/components/ui/confirm";
import { areaIcon } from "../constants";
import { useDeleteAreaMutation } from "../areasApi";
import type { Area } from "../types";
import { useVibeConfig } from "@/features/settings/useVibe";

export interface AreaStats {
  score: number;
  tasksDone: number;
  tasksTotal: number;
  habits: number;
  goals: number;
  streak?: number;
  focusMins?: number;
}

function Metric({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] text-tx-3">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-tx-2">
        {val}
      </span>
    </div>
  );
}

export function AreaCard({ area, stats }: { area: Area; stats: AreaStats }) {
  const [deleteArea, { isLoading }] = useDeleteAreaMutation();
  const cfg = useVibeConfig();
  const showWarning = cfg.showAlerts && stats.score < 40;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: `Delete "${area.name}"?`,
      description:
        "This permanently deletes every goal, project, task, habit, and topic in this area. This can't be undone.",
      confirmText: "Delete",
      danger: true,
    });
    if (ok) deleteArea(area.id);
  };

  return (
    <Link
      to={`/areas/${area.id}`}
      className="card card-pad group relative overflow-hidden block transition-colors hover:border-line-2"
      style={showWarning ? { borderColor: "rgba(255,107,129,0.35)", background: "rgba(255,107,129,0.03)" } : undefined}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-80"
        style={{ background: area.color }}
      />
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-md"
            style={{ background: `${area.color}1c`, color: area.color }}
          >
            {createElement(areaIcon(area.icon), { className: "size-3.5" })}
          </span>
          <span
            className="text-[15px] font-[650]"
            style={{ color: area.color }}
          >
            {area.name}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          title="Delete area"
          className="grid size-7 place-items-center rounded-md text-tx-4 opacity-0 transition hover:bg-surface-3 hover:text-danger group-hover:opacity-100 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {showWarning && (
          <div className="mb-2 flex items-center gap-1.5 rounded-md bg-[rgba(255,107,129,0.1)] px-2 py-1 text-[11px] text-[#ff6b81]">
            <AlertTriangle className="size-3" /> Needs attention
          </div>
        )}
        <Donut value={stats.score} size={88} stroke={8} color={showWarning ? "#ff6b81" : area.color}>
          <span className="font-mono text-[23px] font-semibold">
            {stats.score}
          </span>
        </Donut>
        <div className="flex flex-1 flex-col gap-[7px]">
          <Metric label="Tasks" val={`${stats.tasksDone}/${stats.tasksTotal}`} />
          <Metric label="Habits" val={`${stats.habits}`} />
          <Metric label="Goals" val={`${stats.goals}`} />
        </div>
      </div>

      {area.type === "MAINTENANCE" || !area.isActive ? (
        <div className="mt-3 font-mono text-[10px] tracking-[0.13em] text-tx-4 uppercase">
          {area.type}
          {!area.isActive && " · inactive"}
        </div>
      ) : null}
    </Link>
  );
}
