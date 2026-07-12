import { useRef, useState } from "react";
import { confirm } from "@/components/ui/confirm";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Mic,
  Sparkles,
  Square,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useDictation } from "../useDictation";

import { cn } from "@/lib/utils";
import { runMutation } from "@/lib/run-mutation";
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
import { useAppDispatch } from "@/store/hooks";
import { api } from "@/store/api";
import type { Capture, CaptureType, ConvertCaptureRequest } from "../types";

// ── Visual metadata per capture type ────────────────────────────────────────

const TYPE_META: Record<CaptureType, { label: string; color: string }> = {
  TASK: { label: "Task", color: "#5b8af5" },
  HABIT: { label: "Habit", color: "#7fc97f" },
  NOTE: { label: "Note", color: "var(--warn)" },
  RESOURCE: { label: "Resource", color: "#e07ab1" },
  VAULT: { label: "Vault", color: "#a78bfa" },
};

const TYPES: CaptureType[] = ["TASK", "HABIT", "NOTE", "RESOURCE", "VAULT"];

// ── Inbox input ──────────────────────────────────────────────────────────────

function CaptureInput() {
  const [text, setText] = useState("");
  const [createCapture, { isLoading }] = useCreateCaptureMutation();
  const dispatch = useAppDispatch();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  // On-device dictation (Web Speech API). Recognised speech streams into the
  // textarea so the user can review/edit before submitting — no API key, no
  // quota, no audio upload. The dictated text is just a normal text capture.
  const dictation = useDictation();
  const dictBase = useRef("");

  // Re-poll a few times so the background classification result lands without a
  // manual refresh.
  const pollAfterCapture = () => {
    toast("Captured — AI is sorting…");
    timers.current.forEach(clearTimeout);
    timers.current = [1000, 2500, 4000, 6000].map((ms) =>
      setTimeout(() => {
        dispatch(api.util.invalidateTags([{ type: "Capture", id: "LIST" }]));
      }, ms),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await runMutation(
      createCapture,
      { text: trimmed },
      {
        onSuccess: () => {
          setText("");
          pollAfterCapture();
        },
        errorMessage: "Couldn't save that capture",
      },
    );
  };

  const submitImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    await runMutation(
      createCapture,
      { file, fileName: file.name, text: text.trim() || undefined },
      {
        onSuccess: () => {
          setText("");
          pollAfterCapture();
        },
        errorMessage: "Couldn't save that capture",
      },
    );
  };

  // Paste an image straight into the textarea.
  const onPaste = (e: React.ClipboardEvent) => {
    const img = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (img) {
      e.preventDefault();
      void submitImage(img);
    }
  };

  const toggleDictation = () => {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    // Append to whatever's already typed.
    dictBase.current = text ? text.trimEnd() + " " : "";
    dictation.start((transcript) => setText(dictBase.current + transcript));
  };

  return (
    <form onSubmit={submit} className="card card-pad mb-[var(--gap)]">
      <div className="eyebrow mb-2">Brain dump</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={onPaste}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e as unknown as React.FormEvent);
        }}
        placeholder="Dump anything — type it, speak it, or snap a photo. The AI will sort it."
        rows={3}
        className="w-full resize-none rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2.5 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
      />

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void submitImage(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        {dictation.listening ? (
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-acc">
            <span className="size-2 animate-pulse rounded-full bg-acc" />
            Listening — speak now, tap mic to stop
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] text-tx-4">
            <Sparkles className="size-3" />
            AI classifier · ⌘↵ to submit
          </span>
        )}

        <div className="flex items-center gap-1.5">
          {/* Image */}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={isLoading || dictation.listening}
            title="Capture a photo or image"
            className="grid size-9 place-items-center rounded-[var(--r-sm)] border border-line-2 text-tx-3 hover:text-tx disabled:opacity-40"
          >
            <ImagePlus className="size-4" />
          </button>
          {/* Voice — on-device dictation */}
          {dictation.supported && (
            <button
              type="button"
              onClick={toggleDictation}
              disabled={isLoading}
              title={dictation.listening ? "Stop dictation" : "Dictate (speech to text)"}
              className={cn(
                "grid size-9 place-items-center rounded-[var(--r-sm)] border transition",
                dictation.listening
                  ? "border-transparent bg-acc text-acc-ink"
                  : "border-line-2 text-tx-3 hover:text-tx",
              )}
            >
              {dictation.listening ? <Square className="size-3.5" /> : <Mic className="size-4" />}
            </button>
          )}
          {/* Text submit */}
          <button type="submit" disabled={isLoading || dictation.listening || !text.trim()} className="ds-btn">
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5" />
            )}
            {isLoading ? "Capturing…" : "Capture"}
          </button>
        </div>
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

  const [areaId, setAreaId] = useState(capture.meta?.suggestedAreaId ?? "");
  const [topicId, setTopicId] = useState(capture.meta?.suggestedTopicId ?? "");
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
  const classified = capture.confidence != null;
  const pct = Math.round((capture.confidence ?? 0) * 100);
  const worthNow = capture.worthCheck === "WORTH_NOW";

  const handleDismiss = async () => {
    if (!(await confirm({
      title: "Dismiss this capture?",
      description: "It hasn't been converted into a task, note, or anything else yet — dismissing it deletes it for good.",
      confirmText: "Dismiss",
      danger: true,
    }))) return;
    await runMutation(deleteCapture, capture.id, { errorMessage: "Couldn't dismiss capture" });
  };

  return (
    <div
      className="card card-pad"
      style={{ borderLeft: `3px solid ${classified ? meta.color : "var(--line-2)"}` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Media preview for image/audio captures */}
          {capture.mediaUrl && capture.mediaType === "IMAGE" && (
            <img
              src={capture.mediaUrl}
              alt={capture.meta?.title ?? "Captured image"}
              className="mb-2 max-h-44 w-auto rounded-[var(--r-sm)] border border-line-2 object-cover"
            />
          )}
          {capture.mediaUrl && capture.mediaType === "AUDIO" && (
            <audio src={capture.mediaUrl} controls className="mb-2 h-9 w-full max-w-[280px]" />
          )}
          {capture.meta?.title && (
            <p className="mb-0.5 text-[13.5px] font-[600] leading-snug text-tx">
              {capture.meta.title}
            </p>
          )}
          {capture.text && (
            <p className={`mb-2 leading-relaxed text-tx-3 ${capture.meta?.title ? "text-[12px]" : "text-[13.5px] text-tx"}`}>
              {capture.text}
            </p>
          )}
          {!classified ? (
            <div className="flex items-center gap-1.5 text-[12px] text-tx-4">
              <Loader2 className="size-3 animate-spin" />
              {capture.mediaType && capture.mediaType !== "TEXT" ? "Transcribing…" : "Sorting…"}
            </div>
          ) : (
          <div className="flex flex-wrap items-center gap-2">
            {worthNow && (
              <span
                className="flex items-center gap-1 border-2 px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ color: "var(--ok)", borderColor: "var(--ok)" }}
                title={capture.worthReason ?? "Worth acting on now"}
              >
                <Zap className="size-3" /> Worth now
              </span>
            )}
            {/* Type chip — clickable to cycle */}
            <div className="flex items-center gap-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    runMutation(updateType, { id: capture.id, type: t }, {
                      errorMessage: "Couldn't update capture type",
                    })
                  }
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
            {capture.meta?.suggestedAreaName && (
              <span className="chip text-[10px]">→ {capture.meta.suggestedAreaName}</span>
            )}
            {capture.meta?.suggestedTopicName && (
              <span className="chip text-[10px]">→ {capture.meta.suggestedTopicName}</span>
            )}
            {capture.detectedUrl && (
              <span className="chip text-[10px]">URL detected</span>
            )}
          </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {capture.status === "CONVERTED" ? (
            <span className="flex items-center gap-1 rounded-full bg-ok/10 px-2.5 py-1 text-[11px] font-semibold text-ok">
              <Check className="size-3" /> Auto-converted to {TYPE_META[capture.type].label}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              disabled={!classified}
              className="ds-btn ghost text-[12px] disabled:opacity-50"
              title={!classified ? "Sorting…" : expanded ? "Collapse" : "Convert"}
            >
              {expanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              {expanded ? "Close" : "Convert"}
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            disabled={deleting}
            title="Dismiss"
            className="grid size-7 place-items-center rounded-md text-tx-4 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {expanded && capture.status !== "CONVERTED" && (
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

  // Worth-now items float to the top of the inbox.
  const inbox = [...(captures ?? [])].sort(
    (a, b) =>
      (b.worthCheck === "WORTH_NOW" ? 1 : 0) -
      (a.worthCheck === "WORTH_NOW" ? 1 : 0),
  );

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
