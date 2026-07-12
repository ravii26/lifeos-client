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
  Inbox,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useEnabledModules } from "@/features/settings/useEnabledModules";

interface Command {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
  /** If set, the command is hidden when this module is disabled. */
  module?: string;
}

const GROUP_ORDER = ["Actions", "Navigate", "Theme"];

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
  const { isEnabled } = useEnabledModules();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const allCommands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      onClose();
    };
    return [
      {
        id: "immersive",
        label: "Enter Immersive Focus",
        group: "Actions",
        hint: "⌘F",
        icon: Focus,
        run: go("/focus"),
        module: "focus",
      },
      {
        id: "tweaks",
        label: "Open Tweaks Panel",
        group: "Actions",
        hint: "⌘T",
        icon: SlidersHorizontal,
        run: () => {
          onOpenTweaks();
          onClose();
        },
      },
      { id: "dash", label: "Dashboard", group: "Navigate", icon: LayoutDashboard, run: go("/") },
      { id: "areas", label: "Areas", group: "Navigate", icon: Target, run: go("/areas") },
      { id: "tasks", label: "Tasks", group: "Navigate", icon: ListChecks, run: go("/tasks") },
      { id: "habits", label: "Habits", group: "Navigate", icon: Repeat, run: go("/habits"), module: "habits" },
      { id: "goals", label: "Goals", group: "Navigate", icon: Flag, run: go("/goals"), module: "goals" },
      { id: "calendar", label: "Calendar", group: "Navigate", icon: Calendar, run: go("/calendar"), module: "calendar" },
      { id: "reviews", label: "Reviews", group: "Navigate", icon: ClipboardCheck, run: go("/review"), module: "review" },
      { id: "learn", label: "Knowledge", group: "Navigate", icon: GraduationCap, run: go("/learn"), module: "learn" },
      { id: "vault", label: "Vault", group: "Navigate", icon: Archive, run: go("/vault"), module: "vault" },
      { id: "dump", label: "Capture Inbox", group: "Navigate", icon: Inbox, run: go("/dump") },
      { id: "settings", label: "Settings", group: "Navigate", icon: Settings, run: go("/settings") },
      { id: "identity", label: "Identity", group: "Navigate", icon: Settings, run: go("/identity") },
    ];
  }, [navigate, onClose, onOpenTweaks]);

  // Drop commands for modules the user has disabled.
  const commands = useMemo(
    () => allCommands.filter((c) => !c.module || isEnabled(c.module)),
    [allCommands, isEnabled],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  // Group the filtered results
  const grouped = useMemo(() => {
    const q = query.trim();
    // If searching, show flat list
    if (q) return [{ group: "Results", items: filtered }];
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return GROUP_ORDER
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered, query]);

  // Flat index for keyboard nav
  const flatItems = grouped.flatMap((g) => g.items);
  const clampedActive = Math.min(active, Math.max(0, flatItems.length - 1));

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatItems[clampedActive]?.run();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let globalIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[13vh]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[520px] overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "2px solid var(--tx)",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg
            className="size-4 shrink-0 text-tx-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search commands and pages…"
            className="h-12 flex-1 bg-transparent text-[14px] text-tx outline-none placeholder:text-tx-4"
          />
          <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-tx-4">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-[13px] text-tx-4">
              No results for "<span className="text-tx-2">{query}</span>"
            </p>
          )}

          {grouped.map(({ group, items }) => (
            <div key={group}>
              {/* Group label */}
              {!query.trim() && (
                <div className="mb-1 mt-2 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-tx-4 first:mt-0">
                  {group}
                </div>
              )}
              {items.map((c) => {
                const idx = globalIdx++;
                const isActive = idx === clampedActive;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={c.run}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-100",
                      isActive
                        ? "text-acc-ink"
                        : "text-tx-2 hover:bg-surface-2",
                    )}
                    style={
                      isActive
                        ? {
                            background: "var(--acc)",
                            color: "var(--acc-ink)",
                          }
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
                        isActive ? "bg-[rgba(0,0,0,0.15)]" : "bg-surface-2",
                      )}
                    >
                      <c.icon className="size-3.5" />
                    </span>
                    <span className="flex-1">{c.label}</span>
                    {c.hint && (
                      <kbd
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                          isActive
                            ? "bg-[rgba(0,0,0,0.15)] text-[rgba(0,0,0,0.6)]"
                            : "border border-line bg-surface-2 text-tx-4",
                        )}
                      >
                        {c.hint}
                      </kbd>
                    )}
                    {!c.hint && group === "Navigate" && (
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          isActive ? "text-[rgba(0,0,0,0.5)]" : "text-tx-4",
                        )}
                      >
                        Go
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5">
          {[
            { keys: ["↑", "↓"], label: "navigate" },
            { keys: ["↵"], label: "select" },
            { keys: ["ESC"], label: "close" },
          ].map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-tx-4"
                >
                  {k}
                </kbd>
              ))}
              <span className="text-[11px] text-tx-4">{label}</span>
            </div>
          ))}
          <div className="ml-auto font-mono text-[10px] text-tx-4">
            ⌘K
          </div>
        </div>
      </div>
    </div>
  );
}
