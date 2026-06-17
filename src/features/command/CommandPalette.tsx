import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Calendar,
  ClipboardCheck,
  Flag,
  Focus,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Repeat,
  Settings,
  SlidersHorizontal,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onOpenTweaks,
}: {
  open: boolean;
  onClose: () => void;
  onOpenTweaks: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      onClose();
    };
    return [
      {
        id: "immersive",
        label: "Enter Immersive mode",
        hint: "Focus",
        icon: Focus,
        run: go("/focus"),
      },
      { id: "dash", label: "Dashboard", hint: "Go", icon: LayoutDashboard, run: go("/") },
      { id: "tasks", label: "Tasks", hint: "Go", icon: ListChecks, run: go("/tasks") },
      { id: "habits", label: "Habits", hint: "Go", icon: Repeat, run: go("/habits") },
      { id: "goals", label: "Goals", hint: "Go", icon: Flag, run: go("/goals") },
      { id: "calendar", label: "Calendar", hint: "Go", icon: Calendar, run: go("/calendar") },
      { id: "reviews", label: "Reviews", hint: "Go", icon: ClipboardCheck, run: go("/review") },
      { id: "learn", label: "Learn", hint: "Go", icon: GraduationCap, run: go("/learn") },
      { id: "areas", label: "Areas", hint: "Go", icon: Target, run: go("/areas") },
      { id: "vault", label: "Vault", hint: "Go", icon: Archive, run: go("/vault") },
      { id: "identity", label: "Identity", hint: "Go", icon: Settings, run: go("/settings") },
      {
        id: "tweaks",
        label: "Open Tweaks",
        hint: "Theme",
        icon: SlidersHorizontal,
        run: () => {
          onOpenTweaks();
          onClose();
        },
      },
    ];
  }, [navigate, onClose, onOpenTweaks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  if (!open) return null;

  const clampedActive = Math.min(active, Math.max(0, filtered.length - 1));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[clampedActive]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line-2 bg-surface-1 shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Jump to…"
          className="w-full border-b border-line bg-transparent px-4 py-3.5 text-sm text-tx outline-none placeholder:text-tx-4"
        />

        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-tx-4">
              No matches.
            </p>
          )}
          {filtered.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={c.run}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                i === clampedActive
                  ? "bg-surface-3 text-tx"
                  : "text-tx-2 hover:bg-surface-2",
              )}
            >
              <c.icon
                className={cn(
                  "size-4 shrink-0",
                  i === clampedActive && "text-primary",
                )}
              />
              <span className="flex-1">{c.label}</span>
              <span className="font-mono text-[10px] text-tx-4">{c.hint}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 font-mono text-[10px] text-tx-4">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
