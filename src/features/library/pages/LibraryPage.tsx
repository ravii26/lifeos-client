import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { runMutation } from "@/lib/run-mutation";
import { confirm } from "@/components/ui/confirm";
import {
  useDeleteDocumentMutation,
  useExtractActionsMutation,
  useListDocumentsQuery,
} from "../libraryApi";
import type { LibraryDocument } from "../types";
import { AskPanel } from "../components/AskPanel";
import { DocumentForm } from "../components/DocumentForm";
import { SuggestionsPanel } from "../components/SuggestionsPanel";

function StatusLine({ doc }: { doc: LibraryDocument }) {
  if (doc.status === "PENDING") {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-tx-4">
        <Loader2 className="size-3 animate-spin" /> Indexing…
      </span>
    );
  }
  if (doc.status === "FAILED") {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-danger">
        <AlertTriangle className="size-3" /> {doc.error || "Indexing failed"}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-tx-4">
      <Check className="size-3 text-ok" /> {doc.chunkCount} sections indexed
    </span>
  );
}

function DocumentCard({ doc }: { doc: LibraryDocument }) {
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation();
  const [extractActions, { isLoading: extracting }] = useExtractActionsMutation();
  const [showActions, setShowActions] = useState(false);

  const isReady = doc.status === "READY";

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Delete this document?",
        description: `“${doc.title}” and everything indexed from it will be removed. This can't be undone.`,
        confirmText: "Delete",
        danger: true,
      }))
    )
      return;
    await runMutation(deleteDocument, doc.id, { errorMessage: "Couldn't delete document" });
  };

  // Extract turns the document into proposed Habits/Goals/Tasks, then opens the
  // review panel. Re-running re-generates the pending batch.
  const handleExtract = async () => {
    try {
      await extractActions(doc.id).unwrap();
      setShowActions(true);
    } catch {
      toast.error("Couldn't extract actions — try again.");
    }
  };

  return (
    <div className="card card-pad">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-[13.5px] font-[600] text-tx">
            {doc.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusLine doc={doc} />
            <span className="chip text-[10px]">
              {doc.sourceType === "UPLOADED" ? "Uploaded" : "Pasted"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isReady && (
            <>
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting}
                title="Extract Habits, Goals & Tasks from this document"
                className="ds-btn ghost text-[12px] disabled:opacity-50"
              >
                {extracting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {extracting ? "Extracting…" : "Extract actions"}
              </button>
              <button
                type="button"
                onClick={() => setShowActions((v) => !v)}
                title={showActions ? "Hide actions" : "Show actions"}
                className="grid size-7 place-items-center rounded-md text-tx-4 hover:text-tx"
              >
                {showActions ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete document"
            className="grid size-7 place-items-center rounded-md text-tx-4 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {showActions && isReady && <SuggestionsPanel documentId={doc.id} />}
    </div>
  );
}

export function LibraryPage() {
  // Poll only while something is still indexing, then stop. The interval is
  // driven off the query's own data via an effect (RTK's pollingInterval is a
  // number, not a predicate).
  const [pollMs, setPollMs] = useState(0);
  const { data: documents, isLoading, isError } = useListDocumentsQuery(undefined, {
    pollingInterval: pollMs,
  });

  const docs = documents ?? [];
  const hasPending = docs.some((d) => d.status === "PENDING");

  useEffect(() => {
    setPollMs(hasPending ? 3000 : 0);
  }, [hasPending]);

  return (
    <div className="page rise">
      <div className="page-head">
        <div className="eyebrow">Knowledge · ask</div>
        <h1 className="page-title">Library</h1>
        <div className="page-sub">
          Paste a big guide once. Then ask questions and get answers from your
          own material — no re-reading.
        </div>
      </div>

      <AskPanel documents={docs} />
      <DocumentForm />

      <div className="mb-3 flex items-center justify-between">
        <div className="eyebrow">Documents</div>
        {docs.length > 0 && (
          <span className="font-mono text-[12px] text-tx-3">{docs.length}</span>
        )}
      </div>

      {isLoading && <p className="text-sm text-tx-3">Loading documents…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load documents. Is the backend running?
        </p>
      )}

      {docs.length > 0 && (
        <div className="space-y-[var(--gap)]">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      )}

      {documents && docs.length === 0 && (
        <div className="card card-pad empty">
          No documents yet — paste or upload one above to start asking.
        </div>
      )}
    </div>
  );
}
