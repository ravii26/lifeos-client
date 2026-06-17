/** A stat cell matching the design's `.stat` — big mono number + label. */
export function Stat({
  num,
  label,
  sub,
  color,
}: {
  num: React.ReactNode;
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="stat-num" style={{ color: color ?? "var(--tx)" }}>
        {num}
      </div>
      <div className="stat-lbl">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
