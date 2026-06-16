import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, StickyNote, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  const [addRes, setAddRes] = useState(false);
  const [addNb, setAddNb] = useState(false);
  const [addNote, setAddNote] = useState(false);

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
    return <p className="p-8 text-sm text-tx-3">Loading topic…</p>;
  }
  if (isError || !topic) {
    return (
      <div className="p-8">
        <p className="text-sm text-danger">Couldn't load this topic.</p>
        <Link to="/learn" className="mt-3 inline-block text-sm text-primary">
          ← Back to topics
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link
        to="/learn"
        className="inline-flex items-center gap-1.5 text-xs text-tx-3 hover:text-tx"
      >
        <ArrowLeft className="size-3.5" /> Topics
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {topic.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {area && (
              <span className="flex items-center gap-1.5 text-xs text-tx-3">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </span>
            )}
            {mastery && (
              <span className={cn("text-xs font-medium", mastery.tone)}>
                {mastery.label}
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
          className="grid size-8 shrink-0 place-items-center rounded-md text-tx-4 transition-colors hover:bg-surface-3 hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Resources */}
      <Section
        icon={<BookOpen className="size-3.5" />}
        title="Resources"
        count={resources?.length ?? 0}
        onAdd={() => setAddRes((v) => !v)}
      >
        {addRes && (
          <NewResourceForm topicId={topicId} onClose={() => setAddRes(false)} />
        )}
        {resources && resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((r) => (
              <ResourceRow key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          !addRes && (
            <p className="text-sm text-tx-4">
              No resources yet — books, courses, articles you're learning from.
            </p>
          )
        )}
      </Section>

      {/* Notebooks */}
      <Section
        icon={<BookOpen className="size-3.5" />}
        title="Notebooks"
        count={notebooks?.length ?? 0}
        onAdd={() => setAddNb((v) => !v)}
      >
        {addNb && (
          <NewNotebookForm topicId={topicId} onClose={() => setAddNb(false)} />
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
          !addNb && (
            <p className="text-sm text-tx-4">
              No notebooks yet — group related notes together.
            </p>
          )
        )}
      </Section>

      {/* Notes */}
      <Section
        icon={<StickyNote className="size-3.5" />}
        title="Notes"
        count={notes?.length ?? 0}
        onAdd={() => setAddNote((v) => !v)}
      >
        {addNote && (
          <NewNoteForm
            topicId={topicId}
            notebooks={notebooks ?? []}
            onClose={() => setAddNote(false)}
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
          !addNote && (
            <p className="text-sm text-tx-4">
              No notes yet — capture concepts, insights, and summaries.
            </p>
          )
        )}
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  count,
  onAdd,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
          {icon} {title} · {count}
        </div>
        <Button variant="ghost" size="sm" onClick={onAdd} className="h-7">
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
