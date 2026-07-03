import { useState } from "react";
import { ChevronDown, ExternalLink, Trash2, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useDeleteResourceMutation,
  useUpdateResourceMutation,
  useUpdateResourceProgressMutation,
} from "../knowledgeApi";
import {
  RESOURCE_STATUSES,
  RESOURCE_STATUS_BY_VALUE,
  RESOURCE_TYPE_BY_VALUE,
} from "../constants";
import type { Resource, ResourceStatus } from "../types";

export function ResourceRow({ resource }: { resource: Resource }) {
  const [updateResource] = useUpdateResourceMutation();
  const [deleteResource, { isLoading: deleting }] = useDeleteResourceMutation();
  const [updateProgress, { isLoading: savingProgress }] = useUpdateResourceProgressMutation();
  const [showProgress, setShowProgress] = useState(false);
  const [lessons, setLessons] = useState(String(resource.lessonsCompleted ?? ""));
  const [total, setTotal] = useState(String(resource.totalLessons ?? ""));
  const [mins, setMins] = useState(String(resource.minutesConsumed ?? ""));

  const status = resource.status
    ? RESOURCE_STATUS_BY_VALUE[resource.status]
    : RESOURCE_STATUS_BY_VALUE.NOT_STARTED;
  const typeInfo = RESOURCE_TYPE_BY_VALUE[resource.resourceType];
  const TypeIcon = typeInfo?.icon;

  const pct =
    resource.totalLessons && resource.totalLessons > 0
      ? Math.min(100, Math.round(((resource.lessonsCompleted ?? 0) / resource.totalLessons) * 100))
      : null;

  const handleProgressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProgress({
      id: resource.id,
      data: {
        ...(lessons !== "" ? { lessonsCompleted: Number(lessons) } : {}),
        ...(total !== "" ? { totalLessons: Number(total) } : {}),
        ...(mins !== "" ? { minutesConsumed: Number(mins) } : {}),
        autoComplete: true,
      },
    });
    setShowProgress(false);
  };

  const handleDelete = async () => {
    if (!(await confirm({
      title: `Delete "${resource.title}"?`,
      confirmText: "Delete",
      danger: true,
    }))) return;
    deleteResource(resource.id);
  };

  return (
    <div className={cn("rounded-lg border bg-surface-2 transition-colors", showProgress ? "border-line-2" : "border-line")}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Type icon */}
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-3">
          {TypeIcon && <TypeIcon className="size-4 text-tx-3" />}
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{resource.title}</span>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                title="Open resource"
                className="shrink-0 text-tx-4 hover:text-primary"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-tx-3">
            <span>{typeInfo?.label ?? resource.resourceType}</span>
            {resource.platform && <span>· {resource.platform}</span>}
            {resource.rating != null && (
              <span className="flex items-center gap-0.5 text-warn">
                <Star className="size-3 fill-current" />
                {resource.rating}
              </span>
            )}
            {resource.minutesConsumed != null && !resource.totalLessons && (
              <span className="text-acc">{resource.minutesConsumed}m</span>
            )}
          </div>

          {/* Progress bar */}
          {pct !== null && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-ok" : "bg-acc")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-[10px] text-tx-4">
                {resource.lessonsCompleted ?? 0}/{resource.totalLessons} · {pct}%
              </span>
            </div>
          )}
        </div>

        {/* Status select — simple pill */}
        <Select
          value={resource.status ?? "NOT_STARTED"}
          onValueChange={(v) =>
            updateResource({ id: resource.id, data: { status: v as ResourceStatus } })
          }
        >
          <SelectTrigger
            className={cn(
              "h-6 w-auto min-w-0 gap-1 rounded-full border-0 px-2 py-0 text-[11px] font-semibold shadow-none focus:ring-0",
              status.bg,
              status.tone,
            )}
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", status.dot)} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Progress toggle */}
        <button
          type="button"
          onClick={() => setShowProgress((v) => !v)}
          title="Log progress"
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3",
            showProgress && "bg-surface-3 text-acc",
          )}
        >
          <ChevronDown className={cn("size-3.5 transition-transform", showProgress && "rotate-180")} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete resource"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {showProgress && (
        <form
          onSubmit={handleProgressSave}
          className="flex flex-wrap items-end gap-3 border-t border-line bg-surface-1 px-3 pb-3 pt-2.5"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-tx-4">Lessons done</label>
            <input
              type="number"
              min={0}
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="0"
              className="ds-input w-[80px] py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-tx-4">Total</label>
            <input
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="—"
              className="ds-input w-[80px] py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-tx-4">Minutes</label>
            <input
              type="number"
              min={0}
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              placeholder="0"
              className="ds-input w-[80px] py-1 text-xs"
            />
          </div>
          {pct !== null && (
            <span className="self-end pb-1 text-[11px] text-tx-3">{pct}% done</span>
          )}
          <button type="submit" disabled={savingProgress} className="ds-btn sm ml-auto">
            {savingProgress ? "Saving…" : "Save progress"}
          </button>
        </form>
      )}
    </div>
  );
}
