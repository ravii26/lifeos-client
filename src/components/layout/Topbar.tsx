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
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/features/settings/settingsApi";
import type { Vibe } from "@/features/settings/types";

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

  const vibe: Vibe = settings?.vibe ?? "focused";
  const handleVibeChange = (v: string) => {
    updateSettings({ vibe: v as Vibe });
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface-1/70 px-5 backdrop-blur">
      <span className="font-[640] tracking-[-0.01em]">{title}</span>
      <div className="flex-1" />

      {/* Persistent focus timer — lives in the shell so it survives navigation. */}
      <FocusTimer />

      {/* Vibe selector — reads/writes to backend settings. */}
      <Select value={vibe} onValueChange={handleVibeChange}>
        <SelectTrigger className="h-8 w-[110px] rounded-[var(--r-sm)] border-line bg-surface-2 text-xs font-medium text-tx-2 hover:border-line-2">
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
        className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-tx-3 transition-colors hover:border-line-2 hover:bg-surface-3"
      >
        <Search className="size-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-line-2 bg-surface-4 px-1.5 font-mono text-[10px] text-tx-2">
          ⌘K
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        title="Tweaks"
        onClick={onOpenTweaks}
      >
        <SlidersHorizontal className="size-4" />
      </Button>

      {/* Profile / identity entry point — previously only reachable via ⌘K. */}
      <Link
        to="/identity"
        title="Your profile & identity"
        className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-[var(--acc-ink)] transition-opacity hover:opacity-85"
        style={{ background: "linear-gradient(135deg, var(--acc), var(--health))" }}
      >
        {initial}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        title="Log out"
        onClick={() => dispatch(logout())}
      >
        <LogOut className="size-4" />
      </Button>
    </header>
  );
}
