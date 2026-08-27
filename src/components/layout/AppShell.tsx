import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useLogBehaviorOnMount } from "@/features/behavior/behaviorApi";
import { CommandPalette } from "@/features/command/CommandPalette";
import { TweaksPanel } from "@/features/tweaks/TweaksPanel";
import { AssistantOverlay } from "@/features/assistant/AssistantOverlay";
import { useUIMode } from "@/features/tweaks/uiMode";

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

  const uiMode = useUIMode();
  const isClassic = uiMode === "classic";
  const location = useLocation();

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
    <div className="relative flex h-screen overflow-hidden bg-bg text-tx">
      {/* Background Ambient Glows (Classic Mode only) */}
      {isClassic && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20 select-none z-0">
          <div 
            className="absolute -top-[30%] -left-[10%] h-[75%] w-[65%] rounded-full bg-primary/15 blur-[120px] animate-pulse" 
            style={{ animationDuration: "8s" }} 
          />
          <div 
            className="absolute -bottom-[35%] -right-[15%] h-[80%] w-[70%] rounded-full bg-acc/10 blur-[150px] animate-pulse" 
            style={{ animationDuration: "12s" }} 
          />
        </div>
      )}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenTweaks={() => setTweaksOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="rise">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenTweaks={() => setTweaksOpen(true)}
      />
      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)} />
      <AssistantOverlay />
    </div>
  );
}
