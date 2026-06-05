/** `/videos` liste sayfası skeleton — 16:9 grid silueti. */

type Props = {
  inline?: boolean;
};

export function VideosListSkeleton({ inline = false }: Props) {
  const grid = (
    <div className="dvr-stream" aria-hidden>
      <div className="dvr-skeleton-rail">
        <div className="dvr-skeleton-line dvr-skeleton-line--label" />
        <div className="dvr-skeleton-hscroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--video-tile" />
          ))}
        </div>
      </div>
      <div className="dvr-vertical-grid-section">
        <div className="dvr-video-full-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dvr-skeleton-block dvr-skeleton-block--video-tile" />
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
          <div className="dvr-skeleton-line" style={{ width: "7rem", height: "1.5rem", marginTop: "0.65rem" }} />
        </div>
      </header>
      <div className="dvr-content dvr-content--vertical-page">{grid}</div>
    </div>
  );
}
