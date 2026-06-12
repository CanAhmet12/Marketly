"use client";

export function ForexCategoryPageSkeleton() {
  return (
    <div className="cc-skeleton fc-skeleton" aria-busy="true" aria-label="Forex sayfası yükleniyor">
      <div className="cc-skeleton-toolbar">
        <div className="cc-skeleton-block cc-skeleton-search" />
        <div className="cc-skeleton-links">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cc-skeleton-pill" />
          ))}
        </div>
      </div>

      <div className="cc-skeleton-ticker fc-skeleton-ticker">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="cc-skeleton-ticker-item fc-skeleton-ticker-item" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-pulse fc-skeleton-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="cc-skeleton-pulse-cell" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-regime-grid">
        <div className="cc-skeleton-block cc-skeleton-regime" />
        <div className="cc-skeleton-block cc-skeleton-segments fc-skeleton-heatmap" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-panels-grid cc-skeleton-panels-grid--triple fc-skeleton-panels">
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-tmap fc-skeleton-treemap" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-intel" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-signal-rail fc-skeleton-signal-rail">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cc-skeleton-signal-card fc-skeleton-signal-card" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-screener" />
    </div>
  );
}
