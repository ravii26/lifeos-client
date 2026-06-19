import { cn } from "@/lib/utils";
import type { Confidence } from "../types";
import { CONFIDENCE_BY_LABEL } from "../constants";

/**
 * A small SVG progress ring showing a goal's confidence score, coloured by
 * its label (on-track / at-risk / off-track).
 */
export function ConfidenceRing({
  confidence,
  size = 44,
  stroke = 4,
}: {
  confidence: Confidence;
  size?: number;
  stroke?: number;
}) {
  const meta = CONFIDENCE_BY_LABEL[confidence.label];
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, confidence.confidence));
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`${meta.label} · ${pct}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-500", meta.ring)}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums",
          meta.tone,
        )}
      >
        {pct}
      </span>
    </div>
  );
}
