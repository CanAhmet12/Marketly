/** Keşfet hub skeleton — SSR Suspense + client loading ile aynı DVR silueti. */

type Props = {
  /** Yalnızca içerik alanı (client yükleme) */
  inline?: boolean;
};

function RailSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className="dvr-skeleton-rail">
      <div className="dvr-skeleton-line dvr-skeleton-line--label" />
      <div className={wide ? "dvr-skeleton-live-grid" : "dvr-skeleton-hscroll"}>
        {Array.from({ length: wide ? 1 : 4 }).map((_, i) => (
          <div
            key={i}
            className={wide ? "dvr-skeleton-block dvr-skeleton-block--live-hero" : "dvr-skeleton-block dvr-skeleton-block--pulse-tile"}
          />
        ))}
      </div>
    </div>
  );
}

function ChromeSkeleton() {
  return (
    <>
      <div className="dvr-skeleton-line dvr-skeleton-line--ticker" />
      <div className="dvr-sticky-bar">
        <div className="dvr-sticky-bar__inner">
          <div className="dvr-tab-bar" aria-hidden>
            {["Tümü", "Canlı Yayınlar", "Pulse", "Videolar", "Sinyaller", "Üreticiler"].map((l) => (
              <div key={l} className="dvr-tab dvr-skeleton-tab">
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="dvr-chrome-discovery" aria-hidden>
          <div className="dvr-skeleton-line dvr-skeleton-line--stories" />
          <div className="dvr-skeleton-hscroll dvr-skeleton-hscroll--chips">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="dvr-skeleton-block dvr-skeleton-block--chip" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function DiscoverFeedSkeleton({ inline = false }: Props) {
  const body = (
    <div className="dvr-stream" aria-hidden>
      <RailSkeleton wide />
      <RailSkeleton />
      <RailSkeleton />
    </div>
  );

  if (inline) {
    return <div className="dvr-content">{body}</div>;
  }

  return (
    <div className="dvr-surface" aria-busy="true">
      <header className="dvr-top-chrome">
        <ChromeSkeleton />
      </header>
      <div className="dvr-content">{body}</div>
    </div>
  );
}
