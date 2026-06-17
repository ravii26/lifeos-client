import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useListAreasQuery } from "@/features/areas/areasApi";

import {
  useDeleteNotebookMutation,
  useDeleteTopicMutation,
  useGetTopicQuery,
  useListNotebooksQuery,
  useListNotesQuery,
  useListResourcesQuery,
} from "../knowledgeApi";
import { MASTERY_BY_VALUE } from "../constants";
import { NewResourceForm } from "../components/NewResourceForm";
import { ResourceRow } from "../components/ResourceRow";
import { NewNotebookForm } from "../components/NewNotebookForm";
import { NewNoteForm } from "../components/NewNoteForm";
import { NoteCard } from "../components/NoteCard";

type Tab = "Resources" | "Notebooks" | "Notes";

export function TopicDetailPage() {
  const { topicId = "" } = useParams();
  const navigate = useNavigate();

  const { data: topic, isLoading, isError } = useGetTopicQuery(topicId);
  const { data: areas } = useListAreasQuery();
  const { data: resources } = useListResourcesQuery({ topicId });
  const { data: notebooks } = useListNotebooksQuery({ topicId });
  const { data: notes } = useListNotesQuery({ topicId });

  const [deleteTopic] = useDeleteTopicMutation();
  const [deleteNotebook] = useDeleteNotebookMutation();

  const [tab, setTab] = useState<Tab>("Resources");
  const [adding, setAdding] = useState(false);

  const area = areas?.find((a) => a.id === topic?.areaId);
  const mastery = topic?.masteryLevel
    ? MASTERY_BY_VALUE[topic.masteryLevel]
    : undefined;
  const notebookById = new Map((notebooks ?? []).map((n) => [n.id, n]));

  const handleDeleteTopic = () => {
    if (!topic) return;
    if (
      !window.confirm(
        `Delete "${topic.title}"? This permanently removes all its resources, notebooks, and notes.`,
      )
    )
      return;
    deleteTopic(topic.id);
    navigate("/learn");
  };

  if (isLoading) {
    return <p className="page text-sm text-tx-3">Loading topic…</p>;
  }
  if (isError || !topic) {
    return (
      <div className="page">
        <p className="text-sm text-danger">Couldn't load this topic.</p>
        <Link to="/learn" className="mt-3 inline-block text-sm text-primary">
          ← Back to topics
        </Link>
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
      <Link
        to="/learn"
        className="ds-btn ghost sm mb-4 inline-flex w-fit"
      >
        <ArrowLeft className="size-3.5" /> Back to Learn
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className="eyebrow mb-1"
            style={{ color: area?.color }}
          >
            Topic detail
          </div>
          <h1 className="page-title m-0" style={{ color: area?.color }}>
            {topic.title}
          </h1>
          <div className="page-sub mt-1 flex flex-wrap items-center gap-2">
            {area && <span>{area.name}</span>}
            {mastery && (
              <span className={cn("font-medium", mastery.tone)}>
                · {mastery.label}
              </span>
            )}
          </div>
          {topic.description && (
            <p className="mt-2 max-w-prose text-sm text-tx-3">
              {topic.description}
            </p>
          )}
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

      <div className="card card-pad">
        <div className="tabs mb-4">
          {(["Resources", "Notebooks", "Notes"] as Tab[]).map((t) => (
            <button
              key={t}
              className={cn("tab", tab === t && "on")}
              onClick={() => {
                setTab(t);
                setAdding(false);
              }}
            >
              {t}{" "}
              <span className="font-mono text-xs text-tx-4">{counts[t]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="ds-btn ghost sm ml-auto"
          >
            <Plus className="size-3.5" /> Add
          </button>
        </div>

        {/* Resources */}
        {tab === "Resources" && (
          <div className="flex flex-col gap-3">
            {adding && (
              <NewResourceForm
                topicId={topicId}
                onClose={() => setAdding(false)}
              />
            )}
            {resources && resources.length > 0
              ? resources.map((r) => <ResourceRow key={r.id} resource={r} />)
              : !adding && (
                  <div className="empty">
                    No resources yet — books, courses, articles you're learning
                    from.
                  </div>
                )}
          </div>
        )}

        {/* Notebooks */}
        {tab === "Notebooks" && (
          <div className="flex flex-col gap-3">
            {adding && (
              <NewNotebookForm
                topicId={topicId}
                onClose={() => setAdding(false)}
              />
            )}
            {notebooks && notebooks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {notebooks.map((n) => (
                  <span
                    key={n.id}
                    className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs"
                  >
                    {n.title}
                    <button
                      type="button"
                      onClick={() => deleteNotebook(n.id)}
                      title="Delete notebook"
                      className="text-tx-4 hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              !adding && (
                <div className="empty">
                  No notebooks yet — group related notes together.
                </div>
              )
            )}
          </div>
        )}

        {/* Notes */}
        {tab === "Notes" && (
          <div className="flex flex-col gap-3">
            {adding && (
              <NewNoteForm
                topicId={topicId}
                notebooks={notebooks ?? []}
                onClose={() => setAdding(false)}
              />
            )}
            {notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    notebook={
                      n.notebookId ? notebookById.get(n.notebookId) : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              !adding && (
                <div className="empty">
                  No notes yet — capture concepts, insights, and summaries.
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
