/** `/pulse` liste sayfası skeleton — 9:16 grid silueti. */

type Props = {
  inline?: boolean;
};

export function PulseListSkeleton({ inline = false }: Props) {
  const grid = (
    <div className="dvr-vertical-grid-section" aria-hidden>
      <div className="dvr-pulse-full-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="dvr-skeleton-block dvr-skeleton-block--pulse-tile" />
        ))}
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
          <div className="dvr-skeleton-line" style={{ width: "6rem", height: "1.5rem", marginTop: "0.65rem" }} />
        </div>
      </header>
      <div className="dvr-content dvr-content--vertical-page">{grid}</div>
    </div>
  );
}
