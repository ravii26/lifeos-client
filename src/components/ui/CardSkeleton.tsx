/**
 * Reusable grid-of-cards loading skeleton. Generalizes the pattern that used
 * to live inline in VaultPage — a set of pulsing placeholder cards laid out
 * in a responsive grid, shown while a list query is loading.
 *
 * The default `lines={4}` reproduces the original Vault shape: a title bar,
 * three body bars of varying width, and a full-width footer bar (e.g. a
 * button placeholder).
 */
export function CardSkeleton({
  count = 6,
  lines = 4,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  /** Number of placeholder cards to render. */
  count?: number;
  /** Number of placeholder body bars per card, below the title bar. */
  lines?: number;
  /** Responsive grid-column classes (matches the page's real grid). */
  columns?: string;
}) {
  // Width pattern for body bars, cycling if `lines` exceeds the presets.
  const widths = ["w-3/4", "w-full", "w-5/6"];

  return (
    <div className={`grid gap-[var(--gap)] ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card-pad animate-pulse">
          <div className="mb-3 h-4 w-24 rounded bg-surface-3" />
          {Array.from({ length: lines }).map((_, j) => {
            const isLast = j === lines - 1;
            if (isLast) {
              return <div key={j} className="h-7 w-full rounded bg-surface-2" />;
            }
            const isFirst = j === 0;
            return (
              <div
                key={j}
                className={`${isFirst ? "h-3.5" : "h-3"} ${widths[j % widths.length]} mb-1.5 rounded ${
                  isFirst ? "bg-surface-3" : "bg-surface-2"
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
