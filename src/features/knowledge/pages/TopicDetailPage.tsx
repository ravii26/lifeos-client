import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2, BookOpen, FileText, BookMarked } from "lucide-react";

import { cn } from "@/lib/utils";
import { runMutation } from "@/lib/run-mutation";
import { confirm } from "@/components/ui/confirm";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { useListAreasQuery } from "@/features/areas/areasApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useDeleteNotebookMutation,
  useDeleteTopicMutation,
  useGetTopicQuery,
  useListNotebooksQuery,
  useListNotesQuery,
  useListResourcesQuery,
  useUpdateTopicMutation,
} from "../knowledgeApi";
import { MASTERY_BY_VALUE, MASTERY_LEVELS } from "../constants";
import { NewResourceForm } from "../components/NewResourceForm";
import { ResourceRow } from "../components/ResourceRow";
import { NewNotebookForm } from "../components/NewNotebookForm";
import { NewNoteForm } from "../components/NewNoteForm";
import { NoteCard } from "../components/NoteCard";
import type { MasteryLevel } from "../types";

type Tab = "Resources" | "Notebooks" | "Notes";

const ADD_LABEL: Record<Tab, string> = {
  Resources: "Add resource",
  Notebooks: "Add notebook",
  Notes: "Add note",
};

export function TopicDetailPage() {
  const { topicId = "" } = useParams();
  const navigate = useNavigate();

  const { data: topic, isLoading, isError } = useGetTopicQuery(topicId);
  const { data: areas } = useListAreasQuery();
  const { data: resources, isError: resourcesError } = useListResourcesQuery({ topicId });
  const { data: notebooks, isLoading: notebooksLoading, isError: notebooksError } = useListNotebooksQuery({ topicId });
  const { data: notes, isLoading: notesLoading, isError: notesError } = useListNotesQuery({ topicId });

  const [deleteTopic] = useDeleteTopicMutation();
  const [deleteNotebook] = useDeleteNotebookMutation();
  const [updateTopic] = useUpdateTopicMutation();

  const [tab, setTab] = useState<Tab>("Resources");
  const [adding, setAdding] = useState(false);
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);

  const area = areas?.find((a) => a.id === topic?.areaId);
  const mastery = topic?.masteryLevel ? MASTERY_BY_VALUE[topic.masteryLevel] : MASTERY_BY_VALUE.BEGINNER;
  const areaColor = area?.color ?? "var(--acc)";
  const notebookById = new Map((notebooks ?? []).map((n) => [n.id, n]));
  const completedResources = resources?.filter((r) => r.status === "COMPLETED").length ?? 0;

  const handleDeleteNotebook = async (notebook: { id: string; title: string }) => {
    if (!(await confirm({
      title: `Delete "${notebook.title}"?`,
      confirmText: "Delete",
      danger: true,
    }))) return;
    await runMutation(deleteNotebook, notebook.id, { errorMessage: "Couldn't delete notebook" });
  };

  const handleDeleteTopic = async () => {
    if (!topic) return;
    if (!(await confirm({
      title: `Delete "${topic.title}"?`,
      description: "This removes all its resources, notebooks, and notes.",
      confirmText: "Delete",
      danger: true,
    }))) return;
    await runMutation(deleteTopic, topic.id, {
      onSuccess: () => navigate("/learn"),
      errorMessage: "Couldn't delete topic",
    });
  };

  if (isLoading) return <p className="page text-sm text-tx-3">Loading topic…</p>;
  if (isError || !topic) {
    return (
      <div className="page">
        <p className="text-sm text-danger">Couldn't load this topic.</p>
        <Link to="/learn" className="mt-3 inline-block text-sm text-primary">← Back to topics</Link>
      </div>
    );
  }

  const counts: Record<Tab, number> = {
    Resources: resources?.length ?? 0,
    Notebooks: notebooks?.length ?? 0,
    Notes: notes?.length ?? 0,
  };

  return (
    <div className="page rise">
      <Link to="/learn" className="ds-btn ghost sm mb-5 inline-flex w-fit">
        <ArrowLeft className="size-3.5" /> Back to Learn
      </Link>

      {/* Topic header card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface-1">
        {/* Colored bar */}
        <div className="h-1" style={{ background: areaColor }} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {area && (
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: areaColor }}>
                  {area.name}
                </div>
              )}
              <h1 className="page-title m-0 leading-tight">{topic.title}</h1>
              {topic.description && (
                <p className="mt-2 max-w-prose text-sm text-tx-3">{topic.description}</p>
              )}

              {/* Inline mastery selector */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-tx-4">Mastery level</span>
                <Select
                  value={topic.masteryLevel ?? "BEGINNER"}
                  onValueChange={(v) =>
                    runMutation(
                      updateTopic,
                      { id: topic.id, data: { masteryLevel: v as MasteryLevel } },
                      { errorMessage: "Couldn't update mastery level" },
                    )
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-auto w-fit gap-1.5 rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold shadow-none focus:ring-0 [&>svg]:hidden",
                      mastery.bg,
                      mastery.tone,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", mastery.dot)} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MASTERY_LEVELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeleteTopic}
              title="Delete topic"
              className="grid size-8 shrink-0 place-items-center rounded-md text-tx-4 transition hover:bg-surface-3 hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
            {[
              { icon: BookOpen, val: `${completedResources}/${counts.Resources}`, label: "Resources done", cls: "text-ok" },
              { icon: BookMarked, val: counts.Notebooks, label: "Notebooks", cls: "text-tx" },
              { icon: FileText, val: counts.Notes, label: "Notes", cls: "text-tx" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-surface-3">
                  <s.icon className="size-4 text-tx-3" />
                </div>
                <div>
                  <div className={cn("text-base font-bold leading-none", s.cls)}>{s.val}</div>
                  <div className="mt-0.5 text-[10px] text-tx-4">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs panel */}
      <div className="card card-pad">
        <div className="tabs mb-5 items-center">
          {(["Resources", "Notebooks", "Notes"] as Tab[]).map((t) => (
            <button
              key={t}
              className={cn("tab", tab === t && "on")}
              onClick={() => { setTab(t); setAdding(false); }}
            >
              {t}
              <span className="ml-1.5 font-mono text-[11px] text-tx-4">{counts[t]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className={cn("ds-btn ghost sm ml-auto", adding && "bg-surface-3 text-tx")}
          >
            {adding ? (
              "Cancel"
            ) : (
              <><Plus className="size-3.5" />{ADD_LABEL[tab]}</>
            )}
          </button>
        </div>

        {/* ── Resources ── */}
        {tab === "Resources" && (
          <div className="flex flex-col gap-2">
            {adding && <NewResourceForm topicId={topicId} onClose={() => setAdding(false)} />}
            {resources && resources.length > 0
              ? resources.map((r) => <ResourceRow key={r.id} resource={r} />)
              : !adding && (
                  resourcesError
                    ? <div className="empty text-danger">Couldn't load resources. Try refreshing.</div>
                    : <div className="empty">No resources yet — books, courses, articles you're learning from.</div>
                )}
          </div>
        )}

        {/* ── Notebooks ── */}
        {tab === "Notebooks" && (
          <div className="flex flex-col gap-2">
            {adding && <NewNotebookForm topicId={topicId} onClose={() => setAdding(false)} />}
            {notebooksLoading && !adding && (
              <CardSkeleton columns="sm:grid-cols-2" lines={2} count={4} />
            )}
            {notebooks && notebooks.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {notebooks.map((n) =>
                  n.id === editingNotebookId ? (
                    <NewNotebookForm
                      key={n.id}
                      topicId={topicId}
                      notebook={n}
                      onClose={() => setEditingNotebookId(null)}
                    />
                  ) : (
                    <div
                      key={n.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3.5 py-3 transition-colors hover:border-line-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <BookMarked className="size-3.5 shrink-0 text-tx-4" />
                          <span className="truncate text-sm font-medium">{n.title}</span>
                        </div>
                        {n.description && (
                          <p className="mt-1 truncate text-[12px] text-tx-3">{n.description}</p>
                        )}
                        {n.tags && n.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {n.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] text-tx-4">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setEditingNotebookId(n.id)}
                          title="Edit notebook"
                          className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-tx"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotebook(n)}
                          title="Delete notebook"
                          className="grid size-7 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              !adding && (
                notebooksError
                  ? <div className="empty text-danger">Couldn't load notebooks. Try refreshing.</div>
                  : <div className="empty">No notebooks yet — group related notes together.</div>
              )
            )}
          </div>
        )}

        {/* ── Notes ── */}
        {tab === "Notes" && (
          <div className="flex flex-col gap-2">
            {adding && (
              <NewNoteForm topicId={topicId} notebooks={notebooks ?? []} onClose={() => setAdding(false)} />
            )}
            {notesLoading && !adding && (
              <CardSkeleton columns="sm:grid-cols-2" lines={2} count={4} />
            )}
            {notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {notes.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    topicId={topicId}
                    notebook={n.notebookId ? notebookById.get(n.notebookId) : undefined}
                  />
                ))}
              </div>
            ) : (
              !adding && (
                notesError
                  ? <div className="empty text-danger">Couldn't load notes. Try refreshing.</div>
                  : <div className="empty">No notes yet — capture concepts, insights, and summaries.</div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
