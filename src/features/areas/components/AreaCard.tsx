import { createElement } from "react";
import { Trash2 } from "lucide-react";

import { areaIcon } from "../constants";
import { useDeleteAreaMutation } from "../areasApi";
import type { Area } from "../types";

export function AreaCard({ area }: { area: Area }) {
  const [deleteArea, { isLoading }] = useDeleteAreaMutation();

  const handleDelete = () => {
    if (
      confirm(
        `Delete "${area.name}"?\n\nThis permanently deletes every goal, project, task, habit, and topic in this area. This can't be undone.`,
      )
    ) {
      deleteArea(area.id);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="flex items-start justify-between">
        <div
          className="grid size-10 place-items-center rounded-lg"
          style={{ backgroundColor: `${area.color}1c`, color: area.color }}
        >
          {createElement(areaIcon(area.icon), { className: "size-5" })}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isLoading}
          title="Delete area"
          className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div
        className="mt-3 text-base font-semibold tracking-tight"
        style={{ color: area.color }}
      >
        {area.name}
      </div>
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
        {area.type}
        {!area.isActive && " · inactive"}
      </div>
    </div>
  );
}
