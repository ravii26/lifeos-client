import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAskMutation } from "../libraryApi";
import type { AskResult, AskSourceType, LibraryDocument } from "../types";

const ALL = "all";

const SOURCE_LABEL: Record<AskSourceType, string> = {
  DOCUMENT: "Document",
  NOTE: "Note",
  RESOURCE: "Resource",
};

export function AskPanel({ documents }: { documents: LibraryDocument[] }) {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<string>(ALL);
  const [result, setResult] = useState<AskResult | null>(null);
  const [ask, { isLoading }] = useAskMutation();

  const ready = documents.filter((d) => d.status === "READY");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    try {
      const res = await ask({
        question: q,
        ...(scope !== ALL ? { documentId: scope } : {}),
      }).unwrap();
      setResult(res);
    } catch {
      toast.error("Couldn't get an answer — is the backend running?");
    }
  };

  return (
    <div className="card card-pad mb-[var(--gap)]">
      <div className="eyebrow mb-2">Ask your library</div>

      <form onSubmit={submit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
              submit(e as unknown as React.FormEvent);
          }}
          placeholder="Ask anything — your documents, or your areas, goals, habits, and tasks — e.g. “what's open in Fitness?”"
          rows={2}
          className="w-full resize-none rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2.5 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="max-w-[220px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Everything</SelectItem>
              {ready.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="ds-btn"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Search className="size-3.5" />
            )}
            {isLoading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 border-t border-line-1 pt-3">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-tx">
            {result.answer}
          </p>

          {!result.usedAi && result.sources.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-tx-4">
              <Sparkles className="size-3" />
              AI unavailable — showing the closest matching passage.
            </p>
          )}

          {result.sources.length > 0 && (
            <div className="mt-3">
              <div className="eyebrow mb-1.5">Sources</div>
              <div className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <details
                    key={`${s.sourceType}-${s.sourceId}-${i}`}
                    className="rounded-[var(--r-sm)] border border-line-1 bg-inset px-3 py-2"
                  >
                    <summary className="flex cursor-pointer items-center gap-2 text-[12px] text-tx-2">
                      <span className="rounded-full border border-line-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-tx-4">
                        {SOURCE_LABEL[s.sourceType]}
                      </span>
                      <span className="font-semibold text-tx">
                        {s.heading || s.sourceTitle}
                      </span>
                      <span className="text-tx-4">· {s.sourceTitle}</span>
                      <span className="ml-auto font-mono text-[10px] text-tx-4">
                        {s.score.toFixed(2)}
                      </span>
                    </summary>
                    <p className="mt-2 text-[12px] leading-relaxed text-tx-3">
                      {s.snippet}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
