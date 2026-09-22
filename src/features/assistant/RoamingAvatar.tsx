import { useEffect, useRef, useState } from "react";
import { Avatar3D } from "./Avatar3D";

const SIZE = 112;
const MARGIN = 24;

type Spot = "wander" | "peek-behind" | "peek-over" | "home";

interface Placement {
  left: number;
  top: number;
  z: number; // relative to the What Now card's z-10
}

const readAccent = (): string => {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim();
  return v || "#ff5a1f";
};

const homeSpot = (): Placement => ({
  left: window.innerWidth - SIZE - MARGIN,
  top: window.innerHeight - SIZE - MARGIN,
  z: 40,
});

const wanderSpot = (): Placement => {
  const maxX = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - SIZE - MARGIN * 3);
  return {
    left: MARGIN + Math.random() * (maxX - MARGIN),
    top: MARGIN + 60 + Math.random() * (maxY - MARGIN - 60),
    z: 40,
  };
};

// Tucked behind the card (lower z than the card's z-10) — peeking out from
// its top-right corner. Over it (z-index above) perches on its top edge.
const cardRelativeSpot = (mode: "peek-behind" | "peek-over"): Placement | null => {
  const el = document.getElementById("what-now-card");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (mode === "peek-behind") {
    return { left: r.right - SIZE * 0.45, top: r.top - SIZE * 0.35, z: 5 };
  }
  return { left: r.left + r.width * 0.55, top: r.top - SIZE * 0.55, z: 40 };
};

const nextSpot = (mode: Spot): Placement => {
  if (mode === "home") return homeSpot();
  if (mode === "wander") return wanderSpot();
  return cardRelativeSpot(mode) ?? wanderSpot();
};

// Weighted pick of the next roam state — mostly wandering, occasionally
// anchored to the What Now card (behind it, or perched on top), occasionally
// back to a predictable "home" corner so it's never lost off-screen.
const pickNextMode = (): Spot => {
  const r = Math.random();
  if (r < 0.4) return "wander";
  if (r < 0.65) return "peek-behind";
  if (r < 0.85) return "peek-over";
  return "home";
};

interface RoamingAvatarProps {
  open: boolean;
  talking: boolean;
  thinking: boolean;
  onClick: () => void;
}

// The character itself is the entry point into the assistant — roams the
// dashboard on a loop, tucks behind/perches on the What Now card, and comes
// to rest near the chat panel while it's open. Falls back to a fixed home
// corner (no roaming) under prefers-reduced-motion or on routes without a
// What Now card to anchor to.
export function RoamingAvatar({ open, talking, thinking, onClick }: RoamingAvatarProps) {
  const [placement, setPlacement] = useState<Placement>(homeSpot);
  const [accent, setAccent] = useState(readAccent);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    setAccent(readAccent());
  }, [open]);

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Rest beside the open chat panel, front-most.
      setPlacement({ left: window.innerWidth - 380 - MARGIN - SIZE - 12, top: window.innerHeight - 520 - MARGIN + 8, z: 41 });
      return;
    }

    if (reducedMotion.current) {
      setPlacement(homeSpot());
      return;
    }

    const roam = () => {
      setPlacement(nextSpot(pickNextMode()));
      timerRef.current = setTimeout(roam, 4500 + Math.random() * 3500);
    };
    timerRef.current = setTimeout(roam, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close Jarvis" : "Open Jarvis"}
      title={open ? "Close Jarvis" : "Chat with Jarvis"}
      className="fixed cursor-pointer border-0 bg-transparent p-0 transition-[left,top] duration-[2200ms] ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc"
      style={{ left: placement.left, top: placement.top, zIndex: placement.z, width: SIZE, height: SIZE }}
    >
      <Avatar3D size={SIZE} talking={talking} thinking={thinking} accent={accent} />
    </button>
  );
}
