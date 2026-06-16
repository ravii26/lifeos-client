import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListTopicsQuery } from "../knowledgeApi";
import { TopicCard } from "../components/TopicCard";
import { NewTopicForm } from "../components/NewTopicForm";

export function TopicsPage() {
  const { data: areas } = useListAreasQuery();
  const [areaFilter, setAreaFilter] = useState("");
  const {
    data: topics,
    isLoading,
    isError,
  } = useListTopicsQuery(areaFilter ? { areaId: areaFilter } : undefined);
  const [showForm, setShowForm] = useState(false);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const hasAreas = (areas ?? []).length > 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Insights · knowledge
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Learn</h1>
          <p className="mt-1 text-sm text-tx-3">
            Topics you're studying — with resources, notebooks, and notes.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} disabled={!hasAreas}>
          <Plus className="size-4" /> New topic
        </Button>
      </div>

      {!hasAreas && (
        <p className="mt-6 rounded-lg border border-line-2 bg-surface-2 p-4 text-sm text-tx-3">
          Create a life area first — topics must belong to one.
        </p>
      )}

      {hasAreas && (areas?.length ?? 0) > 1 && (
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs text-tx-3">Area</span>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-2.5 text-sm text-tx outline-none focus-visible:border-ring [color-scheme:dark]"
          >
            <option value="">All</option>
            {areas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <NewTopicForm areas={areas ?? []} onClose={() => setShowForm(false)} />
      )}

      {isLoading && <p className="mt-8 text-sm text-tx-3">Loading topics…</p>}
      {isError && (
        <p className="mt-8 text-sm text-danger">
          Couldn't load your topics. Is the backend running?
        </p>
      )}

      {topics && topics.length === 0 && !showForm && hasAreas && (
        <div className="mt-10 rounded-xl border border-dashed border-line-2 p-12 text-center">
          <p className="text-sm text-tx-2">No topics yet.</p>
          <p className="mt-1 text-sm text-tx-3">
            Start a topic to collect what you're learning.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="size-4" /> Create your first topic
          </Button>
        </div>
      )}

      {topics && topics.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              area={areaById.get(topic.areaId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
