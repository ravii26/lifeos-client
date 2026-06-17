import { useState } from "react";
import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
  RESOURCE_TYPES,
} from "../constants";
import type { Resource, ResourceStatus } from "../types";

const TYPE_LABEL = Object.fromEntries(
  RESOURCE_TYPES.map((t) => [t.value, t.label]),
);

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

  const hasProgress =
    resource.lessonsCompleted != null ||
    resource.totalLessons != null ||
    resource.minutesConsumed != null;

  return (
    <div className="rounded-lg border border-line bg-surface-2">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className={cn("size-2 shrink-0 rounded-full", status.dot)} />

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
            <span>{TYPE_LABEL[resource.resourceType]}</span>
            {resource.platform && <span>· {resource.platform}</span>}
            {hasProgress && (
              <span className="text-acc">
                {resource.lessonsCompleted ?? 0}/{resource.totalLessons ?? "?"} lessons
                {resource.minutesConsumed ? ` · ${resource.minutesConsumed}m` : ""}
              </span>
            )}
          </div>
        </div>

        <Select
          value={resource.status ?? "NOT_STARTED"}
          onValueChange={(v) =>
            updateResource({ id: resource.id, data: { status: v as ResourceStatus } })
          }
        >
          <SelectTrigger className={cn(
            "h-auto border-0 bg-transparent px-0 py-0 text-[11px] font-medium shadow-none focus:ring-0 [&>svg]:size-3",
            status.tone,
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          onClick={() => deleteResource(resource.id)}
          disabled={deleting}
          title="Delete resource"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {showProgress && (
        <form
          onSubmit={handleProgressSave}
          className="flex items-end gap-3 border-t border-line px-3 pb-3 pt-2.5"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-tx-4">Lessons done</label>
            <input
              type="number"
              min={0}
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="0"
              className="ds-input w-[72px] py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-tx-4">Total lessons</label>
            <input
              type="number"
              min={0}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="—"
              className="ds-input w-[72px] py-1 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-tx-4">Minutes</label>
            <input
              type="number"
              min={0}
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              placeholder="0"
              className="ds-input w-[72px] py-1 text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={savingProgress}
            className="ds-btn sm ml-auto"
          >
            {savingProgress ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
