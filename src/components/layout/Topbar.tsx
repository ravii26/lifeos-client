import { LogOut, Search, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logout, selectCurrentUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FocusTimer } from "@/features/focus/components/FocusTimer";
import { runMutation } from "@/lib/run-mutation";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/settings/settingsApi";
import type { Vibe } from "@/features/settings/types";
import { useUIMode } from "@/features/tweaks/uiMode";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/habits": "Habits",
  "/goals": "Goals",
  "/calendar": "Calendar",
  "/review": "Weekly Review",
  "/learn": "Learn",
  "/areas": "Areas",
  "/vault": "Vault",
  "/dump": "Dump",
  "/settings": "Settings",
  "/identity": "Identity",
};

export function Topbar({
  onOpenSearch,
  onOpenTweaks,
}: {
  onOpenSearch: () => void;
  onOpenTweaks: () => void;
}) {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "LifeOS";
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const user = useAppSelector(selectCurrentUser);
  const initial = user?.name?.[0]?.toUpperCase() ?? "?";
  
  const uiMode = useUIMode();
  const isClassic = uiMode === "classic";

  const vibe: Vibe = settings?.vibe ?? "focused";
  const handleVibeChange = (v: string) => {
    runMutation(updateSettings, { vibe: v as Vibe }, { errorMessage: "Couldn't update vibe" });
  };

  return (
    <header 
      className={cn(
        "flex h-14 shrink-0 items-center gap-3 transition-all duration-300 px-5 z-20",
        isClassic 
          ? "border-b border-line bg-surface-1/40 backdrop-blur-md" 
          : "border-b-2 border-tx bg-surface-1"
      )}
    >
      <span className="font-display text-[15px] font-bold">{title}</span>
      <div className="flex-1" />

      {/* Persistent focus timer — lives in the shell so it survives navigation. */}
      <FocusTimer />

      {/* Vibe selector — reads/writes to backend settings. */}
      <Select value={vibe} onValueChange={handleVibeChange}>
        <SelectTrigger 
          className={cn(
            "h-8 w-[110px] text-xs font-bold uppercase tracking-wide text-tx-2 transition-all duration-150 select-none",
            isClassic
              ? "border border-line bg-surface-2 rounded-md hover:bg-surface-3 hover:text-tx"
              : "border-2 border-tx bg-surface-2 hover:bg-surface-3 hover:text-tx"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="focused">Focused</SelectItem>
          <SelectItem value="calm">Calm</SelectItem>
          <SelectItem value="energetic">Energetic</SelectItem>
        </SelectContent>
      </Select>

      {/* Command palette trigger (also opens with ⌘K). */}
      <button
        type="button"
        onClick={onOpenSearch}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] select-none",
          isClassic
            ? "border border-line bg-surface-2 rounded-md text-tx-3 hover:bg-surface-3 hover:text-tx"
            : "border-2 border-tx bg-surface-2 text-tx-3 hover:bg-surface-3 hover:text-tx"
        )}
      >
        <Search className="size-3.5" />
        <span>Search…</span>
        <kbd 
          className={cn(
            "ml-2 px-1.5 font-mono text-[10px] font-bold transition-colors",
            isClassic
              ? "border border-line bg-surface-3 rounded text-tx-3"
              : "border border-tx bg-surface-4 text-tx-2"
          )}
        >
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        title="Tweaks"
        onClick={onOpenTweaks}
        className={cn(
          "transition-all duration-150 hover:scale-105 active:scale-95",
          isClassic ? "rounded-md" : "rounded-none border-2 border-transparent hover:border-tx"
        )}
      >
        <SlidersHorizontal className="size-4" />
      </Button>

      {/* Profile / identity entry point — previously only reachable via ⌘K. */}
      <Link
        to="/identity"
        title="Your profile & identity"
        className={cn(
          "grid size-8 shrink-0 place-items-center font-display text-[13px] font-bold text-primary-foreground transition-all duration-200 ease-out hover:scale-105 select-none",
          isClassic
            ? "rounded-full bg-primary shadow-sm hover:shadow-[0_0_12px_var(--acc-glow)]"
            : "border-2 border-tx bg-primary"
        )}
      >
        {initial}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        title="Log out"
        onClick={() => dispatch(logout())}
        className={cn(
          "transition-all duration-150 hover:scale-105 active:scale-95",
          isClassic ? "rounded-md" : "rounded-none border-2 border-transparent hover:border-tx"
        )}
      >
        <LogOut className="size-4" />
      </Button>
    </header>
  );
}
