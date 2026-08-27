import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Archive,
  BookOpen,
  Calendar,
  ChevronLeft,
  ClipboardCheck,
  Flag,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Repeat,
  Settings,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useListTasksQuery } from "@/features/tasks/tasksApi";
import { useVibeConfig } from "@/features/settings/useVibe";
import { useEnabledModules } from "@/features/settings/useEnabledModules";
import { useUIMode } from "@/features/tweaks/uiMode";

// `module` ties a nav item to a toggleable module; items without one (Dashboard,
// Tasks, Areas, Dump, Settings) are core and always shown.
// `icon` is only rendered in "classic" UI mode — in "brutalist" mode the
// index number IS the mark. A picture-icon-per-row nav is the single most
// recognizable "generated dashboard" tell; a numbered index list reads like
// a table of contents instead.
type NavItem = { label: string; to: string; icon: LucideIcon; end?: boolean; module?: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Execution",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
      { label: "Tasks", to: "/tasks", icon: ListChecks },
      { label: "Habits", to: "/habits", icon: Repeat, module: "habits" },
      { label: "Calendar", to: "/calendar", icon: Calendar, module: "calendar" },
      { label: "Weekly Review", to: "/review", icon: ClipboardCheck, module: "review" },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Goals", to: "/goals", icon: Flag, module: "goals" },
      { label: "Learn", to: "/learn", icon: GraduationCap, module: "learn" },
      { label: "Library", to: "/library", icon: BookOpen, module: "library" },
      { label: "Areas", to: "/areas", icon: Target },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Vault", to: "/vault", icon: Archive, module: "vault" },
      { label: "Dump", to: "/dump", icon: Inbox },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

/** Live wall clock for the sidebar footer (mono, like the design). */
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[11px] text-tx-3">
      {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  // Live count badge for open tasks (shared RTK cache — no extra fetch cost).
  const { data: tasks } = useListTasksQuery();
  const cfg = useVibeConfig();
  const { isEnabled } = useEnabledModules();
  const uiMode = useUIMode();
  const isClassic = uiMode === "classic";

  // Hide nav items whose module is disabled, then drop any group left empty.
  const groups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((item) => !item.module || isEnabled(item.module)),
  })).filter((g) => g.items.length > 0);
  const openTasks = (tasks ?? []).filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  ).length;
  // calm hides nav counts to keep the sidebar quiet.
  const badges: Record<string, number> = cfg.showNavCounts ? { "/tasks": openTasks } : {};

  // Running index across all visible groups (01, 02, 03…) — brutalist-mode
  // only; the number stands in for an icon, so it must stay sequential with
  // no gaps after filtering.
  let runningIndex = 0;

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface-1 transition-all duration-300 ease-in-out select-none",
        isClassic ? "border-r border-line bg-surface-1/60 backdrop-blur-md" : "border-r-2 border-tx",
        collapsed ? "w-16" : "w-[232px]",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 px-4 transition-all duration-300",
          isClassic ? "border-b border-line" : "border-b-2 border-tx",
        )}
      >
        {isClassic ? (
          <>
            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_14px_var(--acc-glow)] transition-all duration-300 hover:scale-105">
              L
            </div>
            {!collapsed && (
              <span className="text-base font-semibold tracking-tight animate-fade-in">
                Life<span className="text-primary">OS</span>
              </span>
            )}
          </>
        ) : (
          <span className="font-display text-[19px] font-[850] tracking-tight text-tx transition-all duration-300">
            {collapsed ? (
              <span className="text-acc">L.</span>
            ) : (
              <span className="animate-fade-in">
                LifeOS<span className="text-acc">.</span>
              </span>
            )}
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 custom-scrollbar">
        {groups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <div className="eyebrow px-2.5 pb-1.5 transition-opacity duration-300">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              runningIndex += 1;
              const index = String(runningIndex).padStart(2, "0");
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 text-sm transition-all duration-150 ease-out",
                      isClassic
                        ? cn(
                            "relative mt-0.5 rounded-md px-2.5 py-2 font-medium",
                            isActive
                              ? "bg-surface-3 text-tx shadow-sm"
                              : "text-tx-2 hover:bg-surface-2 hover:text-tx",
                          )
                        : cn(
                            "px-2.5 py-[7px] border-l-4",
                            isActive
                              ? "bg-tx text-bg font-bold border-acc pl-1.5"
                              : "text-tx-2 hover:bg-surface-3 hover:text-tx font-semibold border-transparent hover:border-tx/20",
                          ),
                      collapsed && "justify-center px-0 border-l-0 pl-0 hover:border-transparent",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isClassic ? (
                        <>
                          {isActive && (
                            <span className="absolute top-1/2 -left-3 h-[18px] w-[3px] -translate-y-1/2 rounded-r bg-primary shadow-[0_0_10px_var(--acc-glow)] animate-slide-in-left" />
                          )}
                          <item.icon
                            className={cn(
                              "size-[18px] shrink-0 transition-transform duration-200 ease-out group-hover:scale-110",
                              isActive && "text-primary"
                            )}
                          />
                        </>
                      ) : (
                        <span
                          className={cn(
                            "w-4 shrink-0 font-mono text-[10.5px] tabular-nums transition-colors duration-150",
                            isActive ? "text-acc font-bold" : "text-tx-4 group-hover:text-acc",
                          )}
                        >
                          {index}
                        </span>
                      )}
                      {!collapsed && (
                        <span className="transition-transform duration-150 ease-out group-hover:translate-x-1.5">
                          {item.label}
                        </span>
                      )}
                      {!collapsed && badges[item.to] > 0 && (
                        <span
                          className={cn(
                            "nav-badge transition-all duration-150",
                            isActive && (isClassic ? "active font-bold" : "border-bg text-bg bg-transparent"),
                          )}
                        >
                          {badges[item.to]}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5",
          isClassic ? "border-t border-line bg-surface-1/40 backdrop-blur-md" : "border-t-2 border-tx",
        )}
      >
        {!collapsed && <Clock />}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="ml-auto grid size-6 place-items-center rounded-md text-tx-3 hover:bg-surface-3 hover:text-tx transition-colors duration-150"
        >
          <ChevronLeft
            className={cn("size-4 transition-transform duration-300 ease-in-out", collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
