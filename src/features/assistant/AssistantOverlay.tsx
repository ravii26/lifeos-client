import { useState, useRef, useEffect } from "react";
import { Brain, Send, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAssistantAskMutation } from "./assistantApi";
import { RoamingAvatar } from "./RoamingAvatar";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

// The floating avatar + chat panel — Phase 1 rough pass: no persisted
// history (each session's turns live only in this component's state), one
// persona routed server-side to either the decisions engine ("what now"
// style messages) or the knowledge/life-data Q&A engine (everything else).
export function AssistantOverlay() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [talking, setTalking] = useState(false);
  const [ask, { isLoading }] = useAssistantAskMutation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const talkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, open]);

  const send = async () => {
    const message = draft.trim();
    if (!message || isLoading) return;
    setDraft("");
    const history = [...turns];
    setTurns((t) => [...t, { role: "user", text: message }]);
    try {
      const result = await ask({ message, history }).unwrap();
      setTurns((t) => [...t, { role: "assistant", text: result.answer }]);
      pulseTalking();
    } catch {
      setTurns((t) => [
        ...t,
        { role: "assistant", text: "Couldn't reach the assistant just now — try again in a moment." },
      ]);
      pulseTalking();
    }
  };

  const pulseTalking = () => {
    if (talkTimerRef.current) clearTimeout(talkTimerRef.current);
    setTalking(true);
    talkTimerRef.current = setTimeout(() => setTalking(false), 1400);
  };

  return (
    <>
      <RoamingAvatar
        open={open}
        talking={talking}
        thinking={isLoading}
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col border-2 border-tx bg-surface-1 shadow-xl">
          <div className="flex items-center gap-2 border-b-2 border-tx px-3.5 py-3">
            <Brain className="size-4 text-acc" />
            <div className="font-display text-[14px] font-bold">Jarvis</div>
            <span className="ml-auto text-[10px] text-tx-4">ask anything, or "what now"</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
            {turns.length === 0 && (
              <p className="text-[12.5px] text-tx-3">
                Ask about your areas, goals, habits, or tasks — or just say "what now" for your
                current priority.
              </p>
            )}
            {turns.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap px-3 py-2 text-[13px] leading-relaxed",
                  t.role === "user"
                    ? "ml-auto border-2 border-tx bg-surface-2 text-tx"
                    : "border-2 border-acc bg-surface-2 text-tx",
                )}
              >
                {t.text}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[12px] text-tx-3">
                <Loader2 className="size-3.5 animate-spin" /> thinking…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t-2 border-tx p-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Message Jarvis…"
              className="flex-1 border-2 border-tx bg-surface-2 px-2.5 py-2 text-[13px] outline-none focus:border-acc"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={isLoading || !draft.trim()}
              className="ds-btn acc sm"
              aria-label="Send"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
