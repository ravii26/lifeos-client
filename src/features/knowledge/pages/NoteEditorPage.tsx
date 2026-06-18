import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ArrowLeft,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Minus,
  Undo,
  Redo,
  BookMarked,
  CheckCircle2,
  Loader2,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useGetNoteQuery,
  useListNotebooksQuery,
  useUpdateNoteMutation,
} from "../knowledgeApi";
import { NOTE_TYPES, NOTE_TYPE_BY_VALUE } from "../constants";
import type { NoteType } from "../types";

/* ── debounce ─────────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

/* ── toolbar button ───────────────────────────────────────────── */
function TBtn({
  icon: Icon,
  title,
  active,
  disabled,
  onClick,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-md transition-colors",
        active
          ? "bg-acc/15 text-acc"
          : "text-tx-3 hover:bg-surface-3 hover:text-tx",
        disabled && "pointer-events-none opacity-30",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

/* ── separator ────────────────────────────────────────────────── */
function Sep() {
  return <div className="mx-1 h-4 w-px shrink-0 bg-line-2" />;
}

/* ── page ─────────────────────────────────────────────────────── */
export function NoteEditorPage() {
  const { topicId = "", noteId = "" } = useParams();
  const { data: note, isLoading, isError } = useGetNoteQuery(noteId);
  const { data: notebooks } = useListNotebooksQuery({ topicId });
  const [updateNote, { isLoading: saving }] = useUpdateNoteMutation();

  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("CONCEPT");
  const [notebookId, setNotebookId] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const initialised = useRef(false);

  /* TipTap editor */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing… Use the toolbar or type / to format",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none min-h-[400px]",
      },
    },
    onUpdate({ editor: e }) {
      setHtmlContent(e.getHTML());
      setDirty(true);
    },
  });

  /* Seed state once note loads */
  useEffect(() => {
    if (note && editor && !initialised.current) {
      setTitle(note.title);
      setNoteType((note.noteType as NoteType) ?? "CONCEPT");
      setNotebookId(note.notebookId ?? "");
      editor.commands.setContent(note.content || "");
      setHtmlContent(note.content || "");
      initialised.current = true;
    }
  }, [note, editor]);

  /* Debounced auto-save */
  const dTitle = useDebounce(title, 1200);
  const dHtml = useDebounce(htmlContent, 1200);
  const dType = useDebounce(noteType, 1200);
  const dNotebook = useDebounce(notebookId, 1200);

  const save = useCallback(async () => {
    if (!noteId || !dirty) return;
    await updateNote({
      id: noteId,
      data: {
        title: dTitle.trim() || note?.title,
        content: dHtml,
        noteType: dType,
        ...(dNotebook ? { notebookId: dNotebook } : {}),
      },
    });
    setSavedAt(new Date());
    setDirty(false);
  }, [noteId, dirty, dTitle, dHtml, dType, dNotebook, note, updateNote]);

  useEffect(() => {
    if (initialised.current && dirty) save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dTitle, dHtml, dType, dNotebook]);

  const typeInfo = NOTE_TYPE_BY_VALUE[noteType];
  const TypeIcon = typeInfo?.icon;

  if (isLoading) {
    return (
      <div className="page flex items-center gap-2 text-sm text-tx-3">
        <Loader2 className="size-4 animate-spin" /> Loading note…
      </div>
    );
  }
  if (isError || !note) {
    return (
      <div className="page">
        <p className="text-sm text-danger">Couldn't load this note.</p>
        <Link to={`/learn/${topicId}`} className="mt-3 inline-block text-sm text-primary">
          ← Back to topic
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-surface-1/90 px-4 py-2 backdrop-blur-sm">
        <Link to={`/learn/${topicId}`} className="ds-btn ghost sm shrink-0">
          <ArrowLeft className="size-3.5" /> Topic
        </Link>
        <div className="h-4 w-px shrink-0 bg-line-2" />

        {/* Note type */}
        <Select
          value={noteType}
          onValueChange={(v) => { setNoteType(v as NoteType); setDirty(true); }}
        >
          <SelectTrigger
            className={cn(
              "h-auto w-fit gap-1.5 rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold shadow-none focus:ring-0 [&>svg]:hidden",
              typeInfo?.bg,
              typeInfo?.tone,
            )}
          >
            {TypeIcon && <TypeIcon className="size-3.5" />}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Notebook */}
        {notebooks && notebooks.length > 0 && (
          <Select
            value={notebookId || "__none__"}
            onValueChange={(v) => { setNotebookId(v === "__none__" ? "" : v); setDirty(true); }}
          >
            <SelectTrigger className="h-auto w-fit gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11px] text-tx-3 shadow-none focus:ring-0 [&>svg]:hidden">
              <BookMarked className="size-3.5 text-tx-4" />
              <SelectValue placeholder="Notebook" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No notebook</SelectItem>
              {notebooks.map((n) => (
                <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Save status */}
        <div className="ml-auto flex items-center gap-1.5 text-[11px]">
          {saving ? (
            <span className="flex items-center gap-1 text-tx-3">
              <Loader2 className="size-3 animate-spin" /> Saving…
            </span>
          ) : dirty ? (
            <span className="text-warn">Unsaved changes</span>
          ) : savedAt ? (
            <span className="flex items-center gap-1 text-ok">
              <CheckCircle2 className="size-3" /> Saved
            </span>
          ) : null}
        </div>
      </header>

      {/* ── Editor area ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24 pt-8">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          placeholder="Untitled note"
          className="mb-6 w-full bg-transparent text-[28px] font-bold leading-tight tracking-tight text-tx outline-none placeholder:text-tx-4"
        />

        {/* Formatting toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1.5">
          <TBtn icon={Bold} title="Bold (Ctrl+B)" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
          <TBtn icon={Italic} title="Italic (Ctrl+I)" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
          <TBtn icon={Strikethrough} title="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} />
          <TBtn icon={Code} title="Inline code" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()} />
          <Sep />
          <TBtn icon={Heading1} title="Heading 1" active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} />
          <TBtn icon={Heading2} title="Heading 2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
          <TBtn icon={Heading3} title="Heading 3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
          <Sep />
          <TBtn icon={List} title="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
          <TBtn icon={ListOrdered} title="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
          <TBtn icon={Quote} title="Blockquote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
          <TBtn icon={Code2} title="Code block" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
          <TBtn icon={Minus} title="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
          <Sep />
          <TBtn icon={Undo} title="Undo (Ctrl+Z)" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
          <TBtn icon={Redo} title="Redo (Ctrl+Y)" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="editor-wrap" />

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-10 flex items-center gap-2 border-t border-line pt-4">
            <Tag className="size-3.5 text-tx-4" />
            {note.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-3 px-2.5 py-0.5 text-[11px] text-tx-3">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
