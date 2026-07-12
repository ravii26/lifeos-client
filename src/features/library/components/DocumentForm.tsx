import { useRef, useState } from "react";
import { FileUp, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { runMutation } from "@/lib/run-mutation";
import { useAppDispatch } from "@/store/hooks";
import { api } from "@/store/api";
import { useCreateDocumentMutation } from "../libraryApi";

export function DocumentForm() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [createDocument, { isLoading }] = useCreateDocumentMutation();
  const dispatch = useAppDispatch();

  // Ingestion (chunk + embed) runs in the background, so re-poll the list a few
  // times to catch the PENDING → READY flip without a manual refresh.
  const pollAfterCreate = () => {
    toast("Added — indexing in the background…");
    timers.current.forEach(clearTimeout);
    timers.current = [1500, 3500, 6000, 9000].map((ms) =>
      setTimeout(
        () => dispatch(api.util.invalidateTags([{ type: "Document", id: "LIST" }])),
        ms,
      ),
    );
  };

  const submitText = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    await runMutation(
      createDocument,
      { title: title.trim() || undefined, text: body },
      {
        onSuccess: () => {
          setText("");
          setTitle("");
          pollAfterCreate();
        },
        errorMessage: "Couldn't add that document",
      },
    );
  };

  const submitFile = async (file: File) => {
    await runMutation(
      createDocument,
      { file, fileName: file.name, title: title.trim() || undefined },
      {
        onSuccess: () => {
          setTitle("");
          pollAfterCreate();
        },
        errorMessage: "Couldn't upload that file",
      },
    );
  };

  return (
    <form onSubmit={submitText} className="card card-pad mb-[var(--gap)]">
      <div className="eyebrow mb-2">Add a document</div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional — inferred from the first line if blank)"
        className="mb-2 w-full rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
            submitText(e as unknown as React.FormEvent);
        }}
        placeholder="Paste a guide, notes, a handbook — anything you'll want to ask about later."
        rows={5}
        className="w-full resize-none rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2.5 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
      />

      <input
        ref={fileInput}
        type="file"
        accept=".txt,.md,.markdown,.text,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void submitFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isLoading}
          className="ds-btn ghost text-[12px] disabled:opacity-40"
        >
          <FileUp className="size-3.5" />
          Upload .txt / .md
        </button>

        <button type="submit" disabled={isLoading || !text.trim()} className="ds-btn">
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          {isLoading ? "Adding…" : "Add document"}
        </button>
      </div>
    </form>
  );
}
