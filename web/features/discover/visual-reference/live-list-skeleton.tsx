/** `/live` liste sayfası skeleton — hero rail + canlı grid silueti. */

type Props = {
  inline?: boolean;
};

export function LiveListSkeleton({ inline = false }: Props) {
  const grid = (
    <div className="dvr-stream" aria-hidden>
      <div className="dvr-skeleton-rail">
        <div className="dvr-skeleton-line dvr-skeleton-line--label" />
        <div className="dvr-skeleton-live-grid">
          <div className="dvr-skeleton-block dvr-skeleton-block--live-hero" />
        </div>
      </div>
      <div className="dvr-skeleton-rail">
        <div className="dvr-skeleton-line dvr-skeleton-line--label" />
        <div className="dvr-skeleton-hscroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--live-compact" />
          ))}
        </div>
      </div>
      <div className="dvr-vertical-grid-section">
        <div className="dvr-live-full-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--live-compact" />
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) return grid;

  return (
    <div className="dvr-surface dvr-surface--vertical-page" aria-busy="true">
      <header className="dvr-top-chrome">
        <div className="dvr-skeleton-line dvr-skeleton-line--ticker" />
        <div className="dvr-vertical-page-head">
          <div className="dvr-skeleton-line" style={{ width: "5rem", height: "0.85rem" }} />
          <div className="dvr-skeleton-line" style={{ width: "9rem", height: "1.5rem", marginTop: "0.65rem" }} />
        </div>
      </header>
      <div className="dvr-content dvr-content--vertical-page">{grid}</div>
    </div>
  );
}
