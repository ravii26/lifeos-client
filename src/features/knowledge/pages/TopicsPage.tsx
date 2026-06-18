import { useMemo, useState } from "react";
import { Plus, BookOpen, TrendingUp, Layers, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { useListAreasQuery } from "@/features/areas/areasApi";

import { useListTopicsQuery } from "../knowledgeApi";
import { TopicCard } from "../components/TopicCard";
import { NewTopicForm } from "../components/NewTopicForm";
import { MASTERY_LEVELS, MASTERY_BY_VALUE } from "../constants";
import type { MasteryLevel } from "../types";

type Sort = "default" | "mastery" | "area";

const MASTERY_ORDER: Record<MasteryLevel, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
  EXPERT: 3,
};

const STATS = [
  {
    key: "topics",
    label: "Topics",
    icon: BookOpen,
    iconCls: "text-tx-3",
    bgCls: "bg-surface-3",
    valCls: "text-tx",
  },
  {
    key: "advanced",
    label: "Advanced+",
    icon: Trophy,
    iconCls: "text-ok",
    bgCls: "bg-ok/10",
    valCls: "text-ok",
  },
  {
    key: "inProgress",
    label: "In progress",
    icon: TrendingUp,
    iconCls: "text-warn",
    bgCls: "bg-warn/10",
    valCls: "text-warn",
  },
  {
    key: "areas",
    label: "Areas covered",
    icon: Layers,
    iconCls: "text-tx-3",
    bgCls: "bg-surface-3",
    valCls: "text-tx",
  },
] as const;

export function TopicsPage() {
  const { data: areas } = useListAreasQuery();
  const [areaFilter, setAreaFilter] = useState("");
  const [masteryFilter, setMasteryFilter] = useState<MasteryLevel | "">("");
  const [sort, setSort] = useState<Sort>("default");
  const { data: topics, isLoading, isError } = useListTopicsQuery(
    areaFilter ? { areaId: areaFilter } : undefined,
  );
  const [showForm, setShowForm] = useState(false);

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const hasAreas = (areas ?? []).length > 0;

  const statValues = useMemo(() => {
    const list = topics ?? [];
    return {
      topics: list.length,
      advanced: list.filter((t) => t.masteryLevel === "ADVANCED" || t.masteryLevel === "EXPERT").length,
      inProgress: list.filter((t) => t.masteryLevel === "INTERMEDIATE").length,
      areas: new Set(list.map((t) => t.areaId)).size,
    };
  }, [topics]);

  const displayed = useMemo(() => {
    let list = topics ?? [];
    if (masteryFilter) list = list.filter((t) => t.masteryLevel === masteryFilter);
    if (sort === "mastery") {
      list = [...list].sort(
        (a, b) =>
          (MASTERY_ORDER[b.masteryLevel as MasteryLevel] ?? 0) -
          (MASTERY_ORDER[a.masteryLevel as MasteryLevel] ?? 0),
      );
    } else if (sort === "area") {
      list = [...list].sort((a, b) =>
        (areaById.get(a.areaId)?.name ?? "").localeCompare(areaById.get(b.areaId)?.name ?? ""),
      );
    }
    return list;
  }, [topics, masteryFilter, sort, areaById]);

  return (
    <div className="page rise">
      {/* Header */}
      <div className="page-head mb-6">
        <div className="eyebrow">Insights · second brain</div>
        <h1 className="page-title">Learn</h1>
        <div className="page-sub">Topics you're studying — resources, notebooks, and notes in one place.</div>
      </div>

      {/* Stats row */}
      {hasAreas && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.key} className="card card-pad flex items-center gap-3">
              <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", s.bgCls)}>
                <s.icon className={cn("size-4", s.iconCls)} />
              </div>
              <div>
                <div className={cn("text-xl font-bold leading-none", s.valCls)}>
                  {statValues[s.key]}
                </div>
                <div className="mt-0.5 text-[11px] text-tx-4">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + actions */}
      <div className="mb-6 space-y-2.5">
        {/* Row 1: area filter */}
        {hasAreas && (areas ?? []).length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[11px] text-tx-4">Area</span>
            <button
              type="button"
              className={cn("tag-toggle", areaFilter === "" && "on")}
              onClick={() => setAreaFilter("")}
            >
              all
            </button>
            {(areas ?? []).map((a) => (
              <button
                key={a.id}
                type="button"
                className={cn("tag-toggle", areaFilter === a.id && "on")}
                onClick={() => setAreaFilter(a.id)}
                style={areaFilter === a.id ? { background: a.color, borderColor: "transparent", color: "#0a0b0d" } : undefined}
              >
                {a.name}
              </button>
            ))}
          </div>
        )}

        {/* Row 2: mastery filter + sort + new topic */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-0.5 text-[11px] text-tx-4">Mastery</span>
          <button
            type="button"
            className={cn("tag-toggle", masteryFilter === "" && "on")}
            onClick={() => setMasteryFilter("")}
          >
            all
          </button>
          {MASTERY_LEVELS.map((m) => (
            <button
              key={m.value}
              type="button"
              className={cn("tag-toggle", masteryFilter === m.value && "on")}
              onClick={() => setMasteryFilter((v) => (v === m.value ? "" : m.value))}
            >
              {m.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-tx-4">Sort</span>
            {(["default", "mastery", "area"] as Sort[]).map((s) => (
              <button
                key={s}
                type="button"
                className={cn("tag-toggle", sort === s && "on")}
                onClick={() => setSort(s)}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              disabled={!hasAreas}
              className="ds-btn ghost sm ml-1"
            >
              <Plus className="size-3.5" /> New topic
            </button>
          </div>
        </div>
      </div>

      {!hasAreas && (
        <div className="card card-pad mb-6 text-sm text-tx-3">
          Create a life area first — topics must belong to one.
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <NewTopicForm areas={areas ?? []} onClose={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-tx-3">Loading topics…</p>}
      {isError && <p className="text-sm text-danger">Couldn't load topics. Is the backend running?</p>}

      {displayed.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((topic) => (
            <TopicCard key={topic.id} topic={topic} area={areaById.get(topic.areaId)} />
          ))}
        </div>
      )}

      {topics && displayed.length === 0 && !showForm && hasAreas && (
        <div className="card card-pad empty">
          {masteryFilter
            ? `No ${MASTERY_BY_VALUE[masteryFilter as MasteryLevel]?.label} topics yet.`
            : "No topics yet — start one to collect what you're learning."}
        </div>
      )}
    </div>
  );
}
