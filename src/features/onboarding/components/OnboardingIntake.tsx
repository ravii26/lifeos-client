import { createElement, useMemo, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { areaIcon } from "@/features/areas/constants";
import { useCreateAreaMutation } from "@/features/areas/areasApi";
import { useCreateGoalMutation } from "@/features/goals/goalsApi";
import { useCreateHabitMutation } from "@/features/habits/habitsApi";
import { useCreateTaskMutation } from "@/features/tasks/tasksApi";
import { useExtractOnboardingMutation } from "../onboardingApi";
import type { OnboardingAction, OnboardingExtraction } from "../types";

const PLACEHOLDER =
  "A few sentences is plenty — e.g. \"I want to get back into running, work's been overwhelming and I keep missing deadlines, and I've drifted from calling my parents.\"";

// New accounts have nothing for the coach to reason over yet, and its flagship
// "What Now" feature is honest about that (see decisions.service.ts's cold-start
// path) rather than hallucinating advice from an empty dataset — but honesty
// alone doesn't give a new user anywhere to start. This turns a few sentences
// into a real proposed setup (Areas + starter Goals/Habits/Tasks) using the
// same AI-extraction pattern already proven in Library's "extract actions",
// so day one isn't just empty forms.
export function OnboardingIntake() {
  const [text, setText] = useState("");
  const [proposal, setProposal] = useState<OnboardingExtraction | null>(null);
  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(new Set());
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);

  const [extract, { isLoading: isExtracting }] = useExtractOnboardingMutation();
  const [createArea] = useCreateAreaMutation();
  const [createGoal] = useCreateGoalMutation();
  const [createHabit] = useCreateHabitMutation();
  const [createTask] = useCreateTaskMutation();

  const actionsByArea = useMemo(() => {
    const m = new Map<string, { action: OnboardingAction; index: number }[]>();
    if (!proposal) return m;
    proposal.actions.forEach((action, index) => {
      const list = m.get(action.areaName) ?? [];
      list.push({ action, index });
      m.set(action.areaName, list);
    });
    return m;
  }, [proposal]);

  const generate = async () => {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      toast.error("Write a sentence or two first");
      return;
    }
    try {
      const result = await extract(trimmed).unwrap();
      if (result.areas.length === 0) {
        toast.error("Couldn't find anything concrete in that — try adding a bit more detail");
        return;
      }
      setProposal(result);
      setCheckedAreas(new Set(result.areas.map((a) => a.name)));
      setCheckedActions(new Set(result.actions.map((_, i) => i)));
    } catch {
      toast.error("Couldn't generate a setup — is the backend running?");
    }
  };

  const toggleArea = (name: string) => {
    setCheckedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAction = (index: number) => {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const createSelected = async () => {
    if (!proposal) return;
    const areasToCreate = proposal.areas.filter((a) => checkedAreas.has(a.name));
    if (areasToCreate.length === 0) {
      toast.error("Pick at least one area");
      return;
    }

    setCreating(true);
    const nameToId = new Map<string, string>();
    let areaFailures = 0;
    let actionFailures = 0;
    let actionsCreated = 0;

    try {
      for (const area of areasToCreate) {
        try {
          const created = await createArea({
            name: area.name,
            type: area.type,
            icon: area.icon,
            color: area.color,
          }).unwrap();
          nameToId.set(area.name, created.id);
        } catch {
          areaFailures += 1;
        }
      }

      for (const [index, action] of proposal.actions.entries()) {
        if (!checkedActions.has(index)) continue;
        const areaId = nameToId.get(action.areaName);
        if (!areaId) continue; // its area was deselected or failed to create

        try {
          if (action.itemType === "GOAL") {
            await createGoal({
              title: action.title,
              areaId,
              description: action.detail,
              priority: action.priority,
              deadline: action.dueDate,
            }).unwrap();
          } else if (action.itemType === "HABIT") {
            await createHabit({
              title: action.title,
              areaId,
              description: action.detail,
              frequency: action.frequency,
              targetMinutes: action.targetMinutes,
            }).unwrap();
          } else {
            await createTask({
              title: action.title,
              areaId,
              description: action.detail,
              priority: action.priority,
              dueDate: action.dueDate,
            }).unwrap();
          }
          actionsCreated += 1;
        } catch {
          actionFailures += 1;
        }
      }

      if (areaFailures === 0 && actionFailures === 0) {
        toast.success(
          `Set up ${areasToCreate.length} area${areasToCreate.length === 1 ? "" : "s"} and ${actionsCreated} item${actionsCreated === 1 ? "" : "s"}`,
        );
      } else {
        toast.error(
          `Created most of it, but ${areaFailures + actionFailures} item${areaFailures + actionFailures === 1 ? "" : "s"} failed — you can add those manually`,
        );
      }
      // areasApi's createArea already invalidates the Area LIST tag, so
      // useListAreasQuery on the Dashboard refetches and this panel unmounts
      // itself (it only renders when areas.length === 0) — no manual nav needed.
    } finally {
      setCreating(false);
    }
  };

  if (!proposal) {
    return (
      <div className="card card-pad">
        <div className="eyebrow mb-1.5 flex items-center gap-1.5">
          <Sparkles className="size-3" /> Let's set up your life
        </div>
        <h2 className="h-display mb-1.5 text-[21px] leading-tight">
          Tell me what's going on, and I'll build your starter setup
        </h2>
        <p className="mb-3 max-w-[560px] text-[13px] text-tx-3">
          LifeOS works off Areas, Goals, Habits, and Tasks — instead of filling those in one at a
          time, just describe your life and what you want to work on. I'll propose a starter set
          you can edit or reject before anything's created.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={4}
          className="w-full resize-none rounded-[var(--r-sm)] border border-line-2 bg-inset px-3 py-2.5 text-sm text-tx outline-none placeholder:text-tx-4 focus-visible:border-acc-line"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-tx-4">
            Nothing is created until you review and confirm on the next step.
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={isExtracting || text.trim().length < 10}
            className="ds-btn acc"
          >
            {isExtracting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Wand2 className="size-3.5" />
            )}
            {isExtracting ? "Thinking…" : "Generate my starter setup"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="eyebrow mb-1">Review before anything's created</div>
          <h2 className="h-display text-[19px] leading-tight">Your proposed starter setup</h2>
        </div>
        <button
          type="button"
          onClick={() => setProposal(null)}
          className="ds-btn ghost sm"
          disabled={creating}
        >
          Start over
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {proposal.areas.map((area) => {
          const items = actionsByArea.get(area.name) ?? [];
          const areaOn = checkedAreas.has(area.name);
          return (
            <div
              key={area.name}
              className="border-2 border-tx bg-surface-2 px-3.5 py-3"
              style={{ opacity: areaOn ? 1 : 0.45 }}
            >
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={areaOn}
                  onChange={() => toggleArea(area.name)}
                  className="size-4 accent-[var(--acc)]"
                />
                <span
                  className="flex size-7 items-center justify-center rounded-full"
                  style={{ background: `${area.color}22`, color: area.color }}
                >
                  {createElement(areaIcon(area.icon), { className: "size-3.5" })}
                </span>
                <span className="text-[14px] font-bold" style={{ color: area.color }}>
                  {area.name}
                </span>
                <span className="chip">{area.type === "PRIMARY" ? "Active focus" : "Maintenance"}</span>
              </label>

              {items.length > 0 && (
                <div className="mt-2.5 ml-[38px] flex flex-col gap-1.5 border-l-2 border-line-1 pl-3">
                  {items.map(({ action, index }) => (
                    <label
                      key={index}
                      className="flex cursor-pointer items-start gap-2 text-[12.5px]"
                    >
                      <input
                        type="checkbox"
                        checked={checkedActions.has(index)}
                        onChange={() => toggleAction(index)}
                        disabled={!areaOn}
                        className="mt-0.5 size-3.5 accent-[var(--acc)]"
                      />
                      <span>
                        <span className="rounded-full border border-line-2 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-tx-4">
                          {action.itemType}
                        </span>{" "}
                        <span className="font-semibold text-tx">{action.title}</span>
                        {action.detail && (
                          <span className="text-tx-4"> — {action.detail}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-tx-4">
          Unchecked items won't be created — you can always add them later manually.
        </p>
        <button
          type="button"
          onClick={createSelected}
          disabled={creating || checkedAreas.size === 0}
          className="ds-btn acc"
        >
          {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
          {creating ? "Setting up…" : "Create selected"}
        </button>
      </div>
    </div>
  );
}
