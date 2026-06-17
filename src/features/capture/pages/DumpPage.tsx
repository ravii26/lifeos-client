import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Sparkles, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListAreasQuery } from "@/features/areas/areasApi";
import { useListTopicsQuery } from "@/features/knowledge/knowledgeApi";

import {
  useConvertCaptureMutation,
  useCreateCaptureMutation,
  useDeleteCaptureMutation,
  useListCapturesQuery,
  useUpdateCaptureTypeMutation,
} from "../captureApi";
import type { Capture, CaptureType, ConvertCaptureRequest } from "../types";

// ── Visual metadata per capture type ────────────────────────────────────────

const TYPE_META: Record<CaptureType, { label: string; color: string }> = {
  TASK: { label: "Task", color: "#5b8af5" },
  HABIT: { label: "Habit", color: "#7fc97f" },
  NOTE: { label: "Note", color: "#f5c842" },
  RESOURCE: { label: "Resource", color: "#e07ab1" },
  VAULT: { label: "Vault", color: "#a78bfa" },
};

const TYPES: CaptureType[] = ["TASK", "HABIT", "NOTE", "RESOURCE", "VAULT"];

// ── Inbox input ──────────────────────────────────────────────────────────────

function CaptureInput() {
  const [text, setText] = useState("");
  const [createCapture, { isLoading }] = useCreateCaptureMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await createCapture({ text: trimmed });
    setText("");
    toast("Captured — AI is classifying…", { icon: "⚡" });
  };

  return (
    <form onSubmit={submit} className="card card-pad mb-[var(--gap)]">
      <div className="eyebrow mb-2">Brain dump</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e as unknown as React.FormEvent);
        }}
        placeholder="Dump anything — ideas, tasks, links, reminders… the AI will sort it."
        rows={3}
        className="w-full resize-none rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2.5 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[12px] text-tx-4">
          <Sparkles className="size-3" />
          AI classifier · ⌘↵ to submit
        </span>
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="ds-btn"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Zap className="size-3.5" />
          )}
          {isLoading ? "Capturing…" : "Capture"}
        </button>
      </div>
    </form>
  );
}

// ── Convert form (inline, per card) ─────────────────────────────────────────

function ConvertForm({
  capture,
  onDone,
}: {
  capture: Capture;
  onDone: () => void;
}) {
  const { data: areas } = useListAreasQuery();
  const { data: topics } = useListTopicsQuery();
  const [convertCapture, { isLoading }] = useConvertCaptureMutation();

  const needsArea = capture.type === "TASK" || capture.type === "HABIT";
  const needsTopic = capture.type === "NOTE" || capture.type === "RESOURCE";
  const isTask = capture.type === "TASK";

  const [areaId, setAreaId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [priority, setPriority] = useState<ConvertCaptureRequest["priority"]>("MEDIUM");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await convertCapture({
        id: capture.id,
        data: {
          ...(needsArea && areaId ? { areaId } : {}),
          ...(needsTopic && topicId ? { topicId } : {}),
          ...(isTask ? { priority } : {}),
        },
      }).unwrap();
      setDone(true);
      toast.success(`Converted to ${TYPE_META[capture.type].label}`);
      setTimeout(onDone, 800);
    } catch {
      setError("Convert failed — check required fields.");
      toast.error("Convert failed — check required fields.");
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 pt-1 text-sm text-ok">
        <Check className="size-4" /> Converted to {TYPE_META[capture.type].label}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 border-t border-line-1 pt-3">
      {needsArea && (
        <Select value={areaId} onValueChange={setAreaId}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Area (required)" />
          </SelectTrigger>
          <SelectContent>
            {(areas ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {needsTopic && (
        <Select value={topicId} onValueChange={setTopicId}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Topic (required)" />
          </SelectTrigger>
          <SelectContent>
            {(topics ?? []).map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {isTask && (
        <Select value={priority} onValueChange={(v) => setPriority(v as ConvertCaptureRequest["priority"])}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((p) => (
              <SelectItem key={p} value={p}>{p[0] + p.slice(1).toLowerCase()} priority</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="ds-btn w-full justify-center"
      >
        {isLoading ? "Converting…" : `Create ${TYPE_META[capture.type].label}`}
      </button>
    </form>
  );
}

// ── Single capture card ──────────────────────────────────────────────────────

function CaptureCard({ capture }: { capture: Capture }) {
  const [expanded, setExpanded] = useState(false);
  const [deleteCapture, { isLoading: deleting }] = useDeleteCaptureMutation();
  const [updateType] = useUpdateCaptureTypeMutation();

  const meta = TYPE_META[capture.type];
  const pct = Math.round((capture.confidence ?? 0) * 100);

  return (
    <div className="card card-pad" style={{ borderLeft: `3px solid ${meta.color}` }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="mb-2 text-[13.5px] leading-relaxed text-tx">
            {capture.text}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Type chip — clickable to cycle */}
            <div className="flex items-center gap-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateType({ id: capture.id, type: t })}
                  className={cn(
                    "chip text-[10px] transition",
                    capture.type === t
                      ? "border-transparent"
                      : "opacity-40 hover:opacity-70",
                  )}
                  style={
                    capture.type === t
                      ? {
                          color: meta.color,
                          background: `${meta.color}1a`,
                          borderColor: "transparent",
                        }
                      : undefined
                  }
                >
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] text-tx-4">{pct}% conf.</span>
            {capture.detectedUrl && (
              <span className="chip text-[10px]">URL detected</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ds-btn ghost text-[12px]"
            title={expanded ? "Collapse" : "Convert"}
          >
            {expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {expanded ? "Close" : "Convert"}
          </button>
          <button
            type="button"
            onClick={() => deleteCapture(capture.id)}
            disabled={deleting}
            title="Dismiss"
            className="grid size-7 place-items-center rounded-md text-tx-4 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <ConvertForm
          capture={capture}
          onDone={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DumpPage() {
  const {
    data: captures,
    isLoading,
    isError,
  } = useListCapturesQuery({ processed: false });

  const inbox = captures ?? [];

  return (
    <div className="page rise">
      <div className="page-head">
        <div className="eyebrow">Capture · inbox</div>
        <h1 className="page-title">Dump</h1>
        <div className="page-sub">
          Brain dump freely. The AI sorts it — you convert when ready.
        </div>
      </div>

      <CaptureInput />

      <div className="mb-3 flex items-center justify-between">
        <div className="eyebrow">Inbox</div>
        {inbox.length > 0 && (
          <span className="font-mono text-[12px] text-tx-3">
            {inbox.length} pending
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-tx-3">Loading inbox…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load captures. Is the backend running?
        </p>
      )}

      {inbox.length > 0 && (
        <div className="space-y-[var(--gap)]">
          {inbox.map((c) => (
            <CaptureCard key={c.id} capture={c} />
          ))}
        </div>
      )}

      {captures && inbox.length === 0 && (
        <div className="card card-pad empty">
          Inbox clear — dump your next thought above.
        </div>
      )}
    </div>
  );
}
