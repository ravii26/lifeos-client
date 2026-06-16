import { Trash2 } from "lucide-react";

import { useDeleteNoteMutation } from "../knowledgeApi";
import { NOTE_TYPES } from "../constants";
import type { Note, Notebook } from "../types";

const TYPE_LABEL = Object.fromEntries(NOTE_TYPES.map((t) => [t.value, t.label]));

export function NoteCard({
  note,
  notebook,
}: {
  note: Note;
  notebook?: Notebook;
}) {
  const [deleteNote, { isLoading: deleting }] = useDeleteNoteMutation();

  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{note.title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-tx-3">
            {note.noteType && <span>{TYPE_LABEL[note.noteType]}</span>}
            {notebook && <span>· {notebook.title}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => deleteNote(note.id)}
          disabled={deleting}
          title="Delete note"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-xs text-tx-2">
        {note.content}
      </p>
    </div>
  );
}
