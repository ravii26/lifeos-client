import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Stat } from "@/components/ui/Stat";
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

  const stats = useMemo(() => {
    const list = topics ?? [];
    const adv = list.filter(
      (t) => t.masteryLevel === "ADVANCED" || t.masteryLevel === "EXPERT",
    ).length;
    const areasCovered = new Set(list.map((t) => t.areaId)).size;
    return [
      { num: list.length, label: "Topics" },
      { num: adv, label: "Advanced+", color: "var(--acc)" },
      { num: list.length - adv, label: "Still learning" },
      { num: areasCovered, label: "Areas covered" },
    ];
  }, [topics]);

  return (
    <div className="page rise">
      <div className="page-head">
        <div className="eyebrow">Insights · second brain</div>
        <h1 className="page-title">Learn</h1>
        <div className="page-sub">
          Topics you're studying — resources, notebooks, and notes in one place.
        </div>
      </div>

      <div className="mb-[var(--gap)] flex items-center justify-between gap-4">
        {/* Area filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className={cn("tag-toggle", areaFilter === "" && "on")}
            onClick={() => setAreaFilter("")}
          >
            all areas
          </button>
          {(areas ?? []).map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn("tag-toggle", areaFilter === a.id && "on")}
              onClick={() => setAreaFilter(a.id)}
              style={
                areaFilter === a.id
                  ? { background: a.color, borderColor: "transparent", color: "#0a0b0d" }
                  : undefined
              }
            >
              {a.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          disabled={!hasAreas}
          className="ds-btn ghost shrink-0"
        >
          <Plus className="size-3.5" /> New topic
        </button>
      </div>

      {!hasAreas && (
        <div className="card card-pad mb-[var(--gap)] text-sm text-tx-3">
          Create a life area first — topics must belong to one.
        </div>
      )}

      {hasAreas && (
        <div className="mb-[var(--gap)] grid grid-cols-2 gap-[var(--gap)] sm:grid-cols-4">
          {stats.map((x) => (
            <div key={x.label} className="card card-pad">
              <Stat num={x.num} label={x.label} color={x.color} />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mb-[var(--gap)]">
          <NewTopicForm areas={areas ?? []} onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading topics…</p>}
      {isError && (
        <p className="text-sm text-danger">
          Couldn't load your topics. Is the backend running?
        </p>
      )}

      {topics && topics.length > 0 && (
        <div className="grid gap-[var(--gap)] sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              area={areaById.get(topic.areaId)}
            />
          ))}
        </div>
      )}

      {topics && topics.length === 0 && !showForm && hasAreas && (
        <div className="card card-pad empty">
          No topics yet — start one to collect what you're learning.
        </div>
      )}
    </div>
  );
}
