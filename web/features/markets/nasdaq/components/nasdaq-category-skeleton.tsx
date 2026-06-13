"use client";

export function NasdaqCategoryPageSkeleton() {
  return (
    <div className="cc-skeleton nq-skeleton" aria-busy="true" aria-label="NASDAQ sayfası yükleniyor">
      <div className="cc-skeleton-toolbar">
        <div className="cc-skeleton-block cc-skeleton-search" />
        <div className="cc-skeleton-links">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cc-skeleton-pill" />
          ))}
        </div>
      </div>

      <div className="cc-skeleton-ticker nq-skeleton-ticker">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="cc-skeleton-ticker-item nq-skeleton-ticker-item" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-pulse nq-skeleton-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="cc-skeleton-pulse-cell" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-regime-grid">
        <div className="cc-skeleton-block cc-skeleton-regime" />
        <div className="cc-skeleton-block cc-skeleton-segments nq-skeleton-heatmap" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-panels-grid cc-skeleton-panels-grid--triple nq-skeleton-panels">
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-tmap nq-skeleton-treemap" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-intel" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-bottom-strip nq-skeleton-bottom-strip">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cc-skeleton-block cc-skeleton-bottom-panel" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-signal-rail nq-skeleton-signal-rail">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cc-skeleton-signal-card nq-skeleton-signal-card" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-screener" />
    </div>
  );
}
