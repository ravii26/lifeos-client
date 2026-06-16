import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";
import { CommandPalette } from "@/features/command/CommandPalette";
import { TweaksPanel } from "@/features/tweaks/TweaksPanel";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * The authenticated app frame: sidebar + topbar + scrollable content.
 * Rendered as a layout route, so every protected page shows inside it
 * via <Outlet />. Also owns the global command palette + tweaks panel.
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  useLogBehaviorOnMount("APP_OPEN", { platform: "web" });

  // Global ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-tx">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenTweaks={() => setTweaksOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenTweaks={() => setTweaksOpen(true)}
      />
      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </div>
  );
}
