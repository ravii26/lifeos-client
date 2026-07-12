import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListAreasQuery } from "@/features/areas/areasApi";
import { runMutation } from "@/lib/run-mutation";
import {
  useAcceptSuggestionMutation,
  useDismissSuggestionMutation,
  useListSuggestionsQuery,
} from "../libraryApi";
import type { Suggestion, SuggestionItemType } from "../types";

const TYPE_META: Record<SuggestionItemType, { label: string; color: string }> = {
  HABIT: { label: "Habit", color: "#7fc97f" },
  GOAL: { label: "Goal", color: "#5b8af5" },
  TASK: { label: "Task", color: "var(--warn)" },
};

function SuggestionRow({ s }: { s: Suggestion }) {
  const { data: areas } = useListAreasQuery();
  const [accept, { isLoading: accepting }] = useAcceptSuggestionMutation();
  const [dismiss, { isLoading: dismissing }] = useDismissSuggestionMutation();

  const meta = TYPE_META[s.itemType];
  const needsArea = s.itemType === "HABIT" || s.itemType === "GOAL";
  const [areaId, setAreaId] = useState(s.suggestedAreaId ?? "");

  const onAccept = async () => {
    if (needsArea && !areaId) {
      toast.error(`Pick an area for this ${meta.label.toLowerCase()}`);
      return;
    }
    try {
      await accept({
        id: s.id,
        documentId: s.documentId,
        areaId: areaId || undefined,
      }).unwrap();
      toast.success(`Added ${meta.label.toLowerCase()}: ${s.title}`);
    } catch {
      toast.error("Couldn't add that — try again.");
    }
  };

  return (
    <div
      className="rounded-[var(--r-sm)] border border-line-1 bg-inset p-3"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="chip text-[10px]"
              style={{ color: meta.color, background: `${meta.color}1a`, borderColor: "transparent" }}
            >
              {meta.label}
            </span>
            {s.frequency && (
              <span className="chip text-[10px]">{s.frequency.toLowerCase()}</span>
            )}
            {s.suggestedAreaName && (
              <span className="chip text-[10px]">→ {s.suggestedAreaName}</span>
            )}
            <span className="font-mono text-[10px] text-tx-4">
              {Math.round(s.confidence * 100)}%
            </span>
          </div>

          <p className="mt-1 text-[13px] font-[600] leading-snug text-tx">{s.title}</p>
          {s.detail && <p className="mt-0.5 text-[12px] leading-relaxed text-tx-3">{s.detail}</p>}

          {needsArea && (
            <div className="mt-2 max-w-[220px]">
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Area (required)" />
                </SelectTrigger>
                <SelectContent>
                  {(areas ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onAccept}
            disabled={accepting || dismissing}
            className="ds-btn text-[12px]"
          >
            {accepting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            Add
          </button>
          <button
            type="button"
            onClick={() =>
              runMutation(dismiss, { id: s.id, documentId: s.documentId }, {
                errorMessage: "Couldn't dismiss suggestion",
              })
            }
            disabled={dismissing || accepting}
            title="Dismiss"
            className="grid size-7 place-items-center rounded-md text-tx-4 hover:text-danger disabled:opacity-50"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuggestionsPanel({ documentId }: { documentId: string }) {
  const { data: suggestions, isLoading } = useListSuggestionsQuery(documentId);
  const list = suggestions ?? [];
  const pending = list.filter((s) => s.status === "PENDING");
  const accepted = list.filter((s) => s.status === "ACCEPTED");

  if (isLoading) {
    return <p className="mt-3 text-[12px] text-tx-4">Loading suggested actions…</p>;
  }
  if (list.length === 0) {
    return (
      <p className="mt-3 text-[12px] text-tx-4">
        No actions extracted yet — run “Extract actions”.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-line-1 pt-3">
      {pending.map((s) => (
        <SuggestionRow key={s.id} s={s} />
      ))}

      {pending.length === 0 && (
        <p className="text-[12px] text-tx-4">All suggestions handled.</p>
      )}

      {accepted.length > 0 && (
        <div className="pt-1">
          <div className="eyebrow mb-1">Added to your system ({accepted.length})</div>
          <div className="space-y-1">
            {accepted.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 text-[12px] text-tx-3"
              >
                <Check className="size-3 shrink-0 text-ok" />
                <span className="text-tx-4">{TYPE_META[s.itemType].label}</span>
                <span className="truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
