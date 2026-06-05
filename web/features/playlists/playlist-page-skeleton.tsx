/** `/playlist/[id]` yükleme silueti. */

export function PlaylistPageSkeleton() {
  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 overflow-x-hidden py-[var(--sp-4)]" aria-busy="true">
      <div className="overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-4)]">
        <div className="flex flex-col gap-[var(--sp-3)] min-[640px]:flex-row">
          <div className="motion-shimmer aspect-video w-full shrink-0 rounded-[12px] bg-[var(--color-divider)] min-[640px]:max-w-[min(52%,420px)]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="motion-shimmer h-5 w-24 rounded bg-[var(--color-divider)]" />
            <div className="motion-shimmer h-7 w-3/4 max-w-sm rounded bg-[var(--color-divider)]" />
            <div className="motion-shimmer h-4 w-full rounded bg-[var(--color-divider)]" />
            <div className="motion-shimmer h-4 w-2/3 rounded bg-[var(--color-divider)]" />
          </div>
        </div>
      </div>
      <div className="mt-[var(--sp-3)] space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="motion-shimmer h-[72px] rounded-[12px] bg-[var(--color-divider)]" />
        ))}
      </div>
    </div>
  );
}
