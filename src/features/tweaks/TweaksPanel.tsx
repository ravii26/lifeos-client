import { useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ACCENTS,
  applyAccent,
  DEFAULT_ACCENT_ID,
  getSavedAccentId,
} from "./theme";

export function TweaksPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [accentId, setAccentId] = useState(getSavedAccentId);

  const choose = (id: string) => {
    setAccentId(id);
    applyAccent(id); // live — repaints :root immediately
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close tweaks"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
      />

      {/* Slide-over */}
      <aside className="fixed top-0 right-0 z-50 flex h-screen w-80 flex-col border-l border-line bg-surface-1 shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-line px-5">
          <span className="font-semibold tracking-tight">Tweaks</span>
          <button
            type="button"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md text-tx-3 hover:bg-surface-3 hover:text-tx"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
            Accent color
          </div>
          <p className="mt-1 text-xs text-tx-3">
            Re-tints the whole interface live.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {ACCENTS.map((a) => {
              const active = a.id === accentId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => choose(a.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                    active
                      ? "border-line-3 bg-surface-2"
                      : "border-line-2 hover:bg-surface-2",
                  )}
                >
                  <span
                    className="grid size-9 place-items-center rounded-full"
                    style={{ backgroundColor: a.acc, color: a.ink }}
                  >
                    {active && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="text-[11px] text-tx-2">{a.label}</span>
                </button>
              );
            })}
          </div>

          {accentId !== DEFAULT_ACCENT_ID && (
            <button
              type="button"
              onClick={() => choose(DEFAULT_ACCENT_ID)}
              className="mt-5 text-xs text-tx-3 hover:text-tx"
            >
              Reset to default
            </button>
          )}
        </div>

        <div className="border-t border-line px-5 py-3 text-[11px] text-tx-4">
          Saved to this browser.
        </div>
      </aside>
    </>
  );
}
