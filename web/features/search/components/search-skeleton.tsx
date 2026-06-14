"use client";

export function SearchSkeleton() {
  return (
    <div className="srch-skeleton" aria-busy="true" aria-label="Sonuçlar yükleniyor">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="srch-skeleton__row">
          <div className="srch-skeleton__thumb" />
          <div className="srch-skeleton__lines">
            <div className="srch-skeleton__line srch-skeleton__line--lg" />
            <div className="srch-skeleton__line srch-skeleton__line--md" />
            <div className="srch-skeleton__line srch-skeleton__line--sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
