/** Minimal full-screen splash shown while restoring a session. */
export function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-primary" />
    </div>
  );
}
