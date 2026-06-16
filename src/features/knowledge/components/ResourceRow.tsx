import { ExternalLink, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  useDeleteResourceMutation,
  useUpdateResourceMutation,
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

  const status = resource.status
    ? RESOURCE_STATUS_BY_VALUE[resource.status]
    : RESOURCE_STATUS_BY_VALUE.NOT_STARTED;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
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
        </div>
      </div>

      <select
        value={resource.status ?? "NOT_STARTED"}
        onChange={(e) =>
          updateResource({
            id: resource.id,
            data: { status: e.target.value as ResourceStatus },
          })
        }
        className={cn(
          "bg-transparent text-[11px] font-medium outline-none",
          status.tone,
        )}
        title="Change status"
      >
        {RESOURCE_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

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
  );
}
