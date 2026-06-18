import { Link } from "react-router-dom";
import { Trash2, Tag, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDeleteNoteMutation } from "../knowledgeApi";
import { NOTE_TYPE_BY_VALUE } from "../constants";
import type { Note, Notebook } from "../types";

export function NoteCard({
  note,
  notebook,
  topicId,
}: {
  note: Note;
  notebook?: Notebook;
  topicId: string;
}) {
  const [deleteNote, { isLoading: deleting }] = useDeleteNoteMutation();
  const typeInfo = note.noteType ? NOTE_TYPE_BY_VALUE[note.noteType] : null;
  const TypeIcon = typeInfo?.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete note "${note.title}"?`)) deleteNote(note.id);
  };

  return (
    <Link
      to={`/learn/${topicId}/notes/${note.id}`}
      className="group flex flex-col rounded-lg border border-line bg-surface-2 transition-all hover:border-line-2 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-3.5 pt-3.5 pb-0">
        {TypeIcon && typeInfo && (
          <div className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md", typeInfo.bg)}>
            <TypeIcon className={cn("size-3.5", typeInfo.tone)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{note.title}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-tx-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-tx-3">
            {typeInfo && <span className={cn("font-medium", typeInfo.tone)}>{typeInfo.label}</span>}
            {notebook && <><span className="text-tx-4">·</span><span>{notebook.title}</span></>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete note"
          className="grid size-7 shrink-0 place-items-center rounded-md text-tx-4 opacity-0 transition-all group-hover:opacity-100 hover:bg-surface-3 hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Content preview */}
      <div className="flex-1 px-3.5 py-2.5">
        <p className="line-clamp-3 text-[12.5px] leading-relaxed text-tx-2">
          {note.content}
        </p>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-t border-line px-3.5 py-2">
          <Tag className="size-3 shrink-0 text-tx-4" />
          {note.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] text-tx-3">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
