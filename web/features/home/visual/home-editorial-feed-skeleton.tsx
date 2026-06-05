/** Editorial akış skeleton — SSR Suspense + client loading ile aynı siluet. */

type Props = {
  /** Yalnızca gönderi listesi (client içi yükleme) */
  inline?: boolean;
  count?: number;
};

function EditorialCardSkeleton() {
  return (
    <div className="animate-pulse space-y-[var(--hv-s-3)]">
      <div className="flex gap-[var(--hv-s-3)]">
        <div className="h-[46px] w-[46px] shrink-0 rounded-full bg-[var(--hv-line-faint)]" />
        <div className="min-w-0 flex-1 space-y-[var(--hv-s-2)] pt-0.5">
          <div className="h-3.5 w-[38%] rounded bg-[var(--hv-line-faint)]" />
          <div className="h-3 w-[52%] rounded bg-[var(--hv-line-faint)]" />
        </div>
      </div>
      <div className="h-4 w-[72%] max-w-md rounded bg-[var(--hv-line-faint)]" />
      <div className="h-3 w-full max-w-xl rounded bg-[var(--hv-line-faint)]" />
      <div className="h-3 w-[88%] max-w-lg rounded bg-[var(--hv-line-faint)]" />
      <div className="flex gap-4 pt-1">
        <div className="h-3 w-12 rounded bg-[var(--hv-line-faint)]" />
        <div className="h-3 w-12 rounded bg-[var(--hv-line-faint)]" />
        <div className="h-3 w-14 rounded bg-[var(--hv-line-faint)]" />
      </div>
    </div>
  );
}

export function HomeEditorialFeedSkeleton({ inline = false, count = 4 }: Props) {
  const cards = (
    <div className={inline ? "space-y-[var(--hv-s-5)] py-[var(--hv-s-6)]" : "hv-ref__posts space-y-[var(--hv-s-5)] py-[var(--hv-s-6)]"} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <EditorialCardSkeleton key={i} />
      ))}
    </div>
  );

  if (inline) return cards;

  return (
    <div className="hv-ref" aria-busy="true">
      <div className="hv-ref__canvas">
        <div className="hv-ref__grid hv-ref__grid--composed">
          <div className="hv-ref__main">
            <div className="hv-ref__feed-col">
              <div className="hv-ref__feed-inner">
                <div className="hv-ref__stream">
                  <div className="hv-ref__mast">
                    <header className="hv-ref__top" aria-hidden>
                      <div className="hv-ref__mast-head">
                        <div className="flex gap-3">
                          <div className="h-9 w-24 animate-pulse rounded-md bg-[var(--hv-line-faint)]" />
                          <div className="h-9 w-16 animate-pulse rounded-md bg-[var(--hv-line-faint)]" />
                        </div>
                      </div>
                      <div className="mt-4 h-10 w-full max-w-2xl animate-pulse rounded-md bg-[var(--hv-line-faint)]" />
                    </header>
                  </div>
                  {cards}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
