"use client";

export function SearchSkeleton() {
  return (
    <div className="sch-skeleton" aria-busy="true" aria-label="Sonuçlar yükleniyor">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="sch-skeleton__row">
          <div className="sch-skeleton__thumb" />
          <div className="sch-skeleton__lines">
            <div className="sch-skeleton__line sch-skeleton__line--lg" />
            <div className="sch-skeleton__line sch-skeleton__line--md" />
            <div className="sch-skeleton__line sch-skeleton__line--sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
