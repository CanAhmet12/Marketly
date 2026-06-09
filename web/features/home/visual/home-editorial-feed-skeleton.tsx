/** Editorial akış skeleton — SSR Suspense + client loading ile aynı siluet. */

import { HomeFeedCreatorSuggestionsSkeleton } from "./home-feed-creator-suggestions-skeleton";

type Props = {
  /** Yalnızca gönderi listesi (client içi yükleme) */
  inline?: boolean;
  count?: number;
  showCreatorSuggest?: boolean;
};



function StoriesSkeleton() {

  return (

    <div className="hv-ref-stories hv-ref-stories--loading" aria-hidden>

      {Array.from({ length: 7 }).map((_, i) => (

        <div key={i} className="hv-ref-stories__hit hv-ref-stories__hit--skeleton">

          <div className="hv-ref-stories__ring">

            <div className="hv-ref-stories__inner" />

          </div>

          <div className="hv-ref-stories__label">&nbsp;</div>

        </div>

      ))}

    </div>

  );

}



function TodayStripSkeleton() {

  return (

    <div className="hv-ref-feed-today" aria-hidden>

      <span className="hv-ref-feed-today__label">Bugün</span>

      <div className="hv-ref-feed-today__chips">

        {Array.from({ length: 5 }).map((_, i) => (

          <span

            key={i}

            className="inline-block h-[1.35rem] w-[4.5rem] animate-pulse rounded-md bg-[var(--hv-line-faint)]"

          />

        ))}

      </div>

    </div>

  );

}



function EditorialCardSkeleton({ lead }: { lead?: boolean }) {
  return (
    <div className={lead ? "hv-ref-article hv-ref-article--lead" : "hv-ref-article"} aria-hidden>
      {lead ? (
        <div className="mb-[var(--hv-s-3)] h-[1.15rem] w-[4.5rem] animate-pulse rounded-full bg-[var(--hv-line-faint)]" />
      ) : null}
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

        <div className="aspect-[16/9] w-full max-w-xl rounded-lg bg-[var(--hv-line-faint)]" />

        <div className="flex gap-4 pt-1">

          <div className="h-3 w-12 rounded bg-[var(--hv-line-faint)]" />

          <div className="h-3 w-12 rounded bg-[var(--hv-line-faint)]" />

          <div className="h-3 w-14 rounded bg-[var(--hv-line-faint)]" />

          <div className="h-3 w-12 rounded bg-[var(--hv-line-faint)]" />

        </div>

      </div>

    </div>

  );

}


export function HomeEditorialFeedSkeleton({
  inline = false,
  count = 4,
  showCreatorSuggest = false,
}: Props) {
  const cards = (
    <div className={inline ? "py-[var(--hv-s-6)]" : "hv-ref__posts py-[var(--hv-s-6)]"} aria-hidden>
      <TodayStripSkeleton />
      {Array.from({ length: count }).map((_, i) => (
        <EditorialCardSkeleton key={i} lead={i === 0} />
      ))}
      {showCreatorSuggest ? <HomeFeedCreatorSuggestionsSkeleton /> : null}
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

                        <div className="flex gap-3 py-1">

                          <div className="h-9 w-24 animate-pulse rounded-md bg-[var(--hv-line-faint)]" />

                          <div className="h-9 w-16 animate-pulse rounded-md bg-[var(--hv-line-faint)]" />

                        </div>

                      </div>

                      <div className="hv-ref-strip-region">

                        <StoriesSkeleton />

                      </div>

                    </header>

                  </div>

                  {cards}

                </div>

              </div>

            </div>

          </div>



          <aside className="hv-ref__rail-col hv-ref__rail-col--ambient" aria-hidden>

            <div className="hv-ref__rail-bridge">

              <div className="hv-ref-rail hv-ref-rail--rich">

                <div className="hv-ref-rail__section hv-ref-rail__section--soft">

                  <div className="hv-ref-rail__section-head">

                    <div className="h-3 w-24 animate-pulse rounded bg-[var(--hv-line-faint)]" />

                  </div>

                  <div className="mt-[var(--hv-s-3)] space-y-[var(--hv-s-3)]">

                    {Array.from({ length: 5 }).map((_, i) => (

                      <div key={i} className="flex items-center justify-between gap-2">

                        <div className="h-3 w-[45%] animate-pulse rounded bg-[var(--hv-line-faint)]" />

                        <div className="h-3 w-[22%] animate-pulse rounded bg-[var(--hv-line-faint)]" />

                      </div>

                    ))}

                  </div>

                </div>

                <div className="hv-ref-rail__section hv-ref-rail__section--soft">

                  <div className="hv-ref-rail__section-head">

                    <div className="h-3 w-32 animate-pulse rounded bg-[var(--hv-line-faint)]" />

                  </div>

                  <div className="mt-[var(--hv-s-3)] space-y-[var(--hv-s-4)]">

                    {Array.from({ length: 3 }).map((_, i) => (

                      <div key={i} className="flex items-center gap-[var(--hv-s-3)]">

                        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[var(--hv-line-faint)]" />

                        <div className="min-w-0 flex-1 space-y-[var(--hv-s-2)]">

                          <div className="h-3 w-[55%] animate-pulse rounded bg-[var(--hv-line-faint)]" />

                          <div className="h-2.5 w-[35%] animate-pulse rounded bg-[var(--hv-line-faint)]" />

                        </div>

                        <div className="h-6 w-14 shrink-0 animate-pulse rounded-full bg-[var(--hv-line-faint)]" />

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>

  );

}


