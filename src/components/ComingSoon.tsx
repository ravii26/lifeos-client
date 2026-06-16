import { useLocation } from "react-router-dom";

/** Placeholder for nav destinations whose feature isn't built yet. */
export function ComingSoon() {
  const { pathname } = useLocation();
  const name = pathname.replace("/", "") || "Page";

  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-tx-3">
          Coming soon
        </div>
        <h2 className="mt-2 text-xl font-semibold capitalize tracking-tight">
          {name}
        </h2>
        <p className="mt-1 text-sm text-tx-3">
          This screen lands as we build its feature.
        </p>
      </div>
    </div>
  );
}
