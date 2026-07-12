import { useState } from "react";
import { Link2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ApiError } from "@/lib/api/axiosBaseQuery";
import { parseApiErrors } from "@/lib/api/formErrors";
import { runMutation } from "@/lib/run-mutation";
import { useListGoalsQuery } from "@/features/goals/goalsApi";
import {
  useListTopicsQuery,
  useListResourcesQuery,
  useListNotesQuery,
} from "@/features/knowledge/knowledgeApi";

import {
  useListLinksQuery,
  useCreateLinkMutation,
  useDeleteLinkMutation,
} from "../linksApi";
import type { EntityType, LinkRole } from "../types";

// The target kinds we expose in the picker — a 1:1 subset of EntityType that
// covers the founder's ask (Goals + Knowledge + Learn). Habit/Vault/Project are
// valid links server-side but not surfaced here yet.
type Kind = "GOAL" | "TOPIC" | "RESOURCE" | "NOTE";

const KIND_LABEL: Record<Kind, string> = {
  GOAL: "Goal",
  TOPIC: "Topic",
  RESOURCE: "Resource",
  NOTE: "Note",
};

// Lowercase human noun for a chip, e.g. "advances goal".
const TYPE_NOUN: Record<EntityType, string> = {
  TASK: "task",
  GOAL: "goal",
  PROJECT: "project",
  RESOURCE: "resource",
  TOPIC: "topic",
  NOTE: "note",
  HABIT: "habit",
  VAULT: "vault item",
};

export function TaskLinks({ taskId }: { taskId: string }) {
  const { data: links = [] } = useListLinksQuery({ type: "TASK", id: taskId });
  const [createLink, { isLoading: creating }] = useCreateLinkMutation();
  const [deleteLink] = useDeleteLinkMutation();

  const [kind, setKind] = useState<Kind>("GOAL");
  const [topicId, setTopicId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [role, setRole] = useState<LinkRole>("ADVANCES");

  const needsTopic = kind === "RESOURCE" || kind === "NOTE";

  // Each candidate list loads only when its kind is selected (RTK `skip`).
  const { data: goals = [] } = useListGoalsQuery(undefined, {
    skip: kind !== "GOAL",
  });
  const { data: topics = [] } = useListTopicsQuery(undefined, {
    skip: !(kind === "TOPIC" || needsTopic),
  });
  const { data: resources = [] } = useListResourcesQuery(
    { topicId },
    { skip: kind !== "RESOURCE" || !topicId },
  );
  const { data: notes = [] } = useListNotesQuery(
    { topicId },
    { skip: kind !== "NOTE" || !topicId },
  );

  const targetOptions: { id: string; title: string }[] =
    kind === "GOAL"
      ? goals
      : kind === "TOPIC"
        ? topics
        : kind === "RESOURCE"
          ? resources
          : notes;

  const onKindChange = (v: Kind) => {
    setKind(v);
    setTopicId("");
    setTargetId("");
  };

  const add = async () => {
    if (!targetId) return;
    try {
      await createLink({
        fromType: "TASK",
        fromId: taskId,
        toType: kind, // Kind is a subset of EntityType
        toId: targetId,
        role,
      }).unwrap();
      setTargetId("");
      toast.success("Linked");
    } catch (err) {
      const { message } = parseApiErrors(err as ApiError);
      toast.error(message ?? "Couldn't add link");
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-line-2 bg-surface-2 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link2 className="size-3.5 text-tx-3" />
        Linked to
      </div>

      {/* Existing links */}
      {links.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {links.map((link) => {
            // The anchor is (TASK, taskId); show whichever end isn't the anchor.
            const isFromAnchor =
              link.fromType === "TASK" && link.fromId === taskId;
            const otherType = isFromAnchor ? link.toType : link.fromType;
            const otherLabel = isFromAnchor ? link.toLabel : link.fromLabel;
            return (
              <span
                key={link.id}
                className="chip flex items-center gap-1.5 px-2 py-1 text-[10.5px]"
                title={`${link.role === "ADVANCES" ? "Advances" : "References"} ${TYPE_NOUN[otherType]}`}
              >
                <span className="text-tx-4">
                  {link.role === "ADVANCES" ? "↳ advances" : "· refs"}
                </span>
                <span className="text-tx-3">{TYPE_NOUN[otherType]}:</span>
                <span className="max-w-[160px] truncate font-medium">
                  {otherLabel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    runMutation(deleteLink, link.id, { errorMessage: "Couldn't remove link" })
                  }
                  title="Remove link"
                  className="grid size-3.5 place-items-center rounded text-tx-4 hover:text-danger"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-tx-4">
          Nothing linked yet — connect this task to a goal, topic, resource, or
          note.
        </p>
      )}

      {/* Add-link picker */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-tx-3">Link to</Label>
          <Select value={kind} onValueChange={(v) => onKindChange(v as Kind)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-tx-3">Relationship</Label>
          <Select value={role} onValueChange={(v) => setRole(v as LinkRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADVANCES">Advances (counts toward it)</SelectItem>
              <SelectItem value="REFERENCES">References (just context)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resources & notes live under a topic — choose it first. */}
        {needsTopic && (
          <div className="space-y-1.5">
            <Label className="text-[11px] text-tx-3">Topic</Label>
            <Select
              value={topicId}
              onValueChange={(v) => {
                setTopicId(v);
                setTargetId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-[11px] text-tx-3">{KIND_LABEL[kind]}</Label>
          <Select
            value={targetId}
            onValueChange={setTargetId}
            disabled={needsTopic && !topicId}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  needsTopic && !topicId
                    ? "Pick a topic first"
                    : targetOptions.length
                      ? `Choose a ${KIND_LABEL[kind].toLowerCase()}`
                      : `No ${KIND_LABEL[kind].toLowerCase()}s`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {targetOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!targetId || creating}
        className="ds-btn tiny ghost"
      >
        <Plus className="size-3" />
        {creating ? "Linking…" : "Add link"}
      </button>
    </div>
  );
}
