export function WatchPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-full" aria-hidden="true">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4">
          <div className="motion-shimmer aspect-video w-full rounded-[var(--radius-xl)] bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-7 w-3/4 rounded bg-[var(--color-divider)]" />
          <div className="motion-shimmer h-4 w-1/2 rounded bg-[var(--color-divider)]" />
          <div className="flex gap-3 pt-2">
            <div className="motion-shimmer h-10 w-10 rounded-full bg-[var(--color-divider)]" />
            <div className="flex-1 space-y-2">
              <div className="motion-shimmer h-4 w-36 rounded bg-[var(--color-divider)]" />
              <div className="motion-shimmer h-3 w-24 rounded bg-[var(--color-divider)]" />
            </div>
          </div>
        </div>
        <div className="hidden space-y-3 lg:block">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="motion-shimmer h-[90px] w-[160px] shrink-0 rounded-[var(--radius-md)] bg-[var(--color-divider)]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="motion-shimmer h-4 w-full rounded bg-[var(--color-divider)]" />
                <div className="motion-shimmer h-3 w-2/3 rounded bg-[var(--color-divider)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
