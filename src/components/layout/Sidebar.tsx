import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Archive,
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

// `module` ties a nav item to a toggleable module; items without one (Dashboard,
// Tasks, Areas, Dump, Settings) are core and always shown.
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

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-line bg-surface-1/60",
        collapsed ? "w-16" : "w-[232px]",
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_14px_var(--acc-glow)]">
          L
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">
            Life<span className="text-primary">OS</span>
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5">
        {groups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <div className="px-2.5 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "relative mt-0.5 flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-3 text-tx"
                      : "text-tx-2 hover:bg-surface-2 hover:text-tx",
                    collapsed && "justify-center px-0",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-1/2 -left-3 h-[18px] w-[3px] -translate-y-1/2 rounded-r bg-primary shadow-[0_0_10px_var(--acc-glow)]" />
                    )}
                    <item.icon
                      className={cn("size-[18px] shrink-0", isActive && "text-primary")}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && badges[item.to] > 0 && (
                      <span className={cn("nav-badge", isActive && "active")}>
                        {badges[item.to]}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        {!collapsed && <Clock />}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand" : "Collapse"}
          className="ml-auto grid size-6 place-items-center rounded-md text-tx-3 hover:bg-surface-3 hover:text-tx"
        >
          <ChevronLeft
            className={cn("size-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
