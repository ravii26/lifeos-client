/** The design's habit heat-strip: last N days as small squares, recent brighter. */
export function HabitDots({
  history,
  color = "var(--acc)",
  count = 30,
}: {
  history: boolean[];
  color?: string;
  count?: number;
}) {
  const slice = history.slice(-count);
  return (
    <div className="flex items-center gap-[3px]">
      {slice.map((d, i) => (
        <span
          key={i}
          className="size-[7px] rounded-[2px]"
          style={{
            background: d ? color : "var(--surface-3)",
            opacity: d ? 0.45 + 0.55 * (i / Math.max(1, slice.length)) : 1,
          }}
        />
      ))}
    </div>
  );
}
