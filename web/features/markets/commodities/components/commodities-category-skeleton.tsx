"use client";

export function CommoditiesCategoryPageSkeleton() {
  return (
    <div className="cc-skeleton cm-skeleton" aria-busy="true" aria-label="Emtia sayfası yükleniyor">
      <div className="cc-skeleton-toolbar">
        <div className="cc-skeleton-block cc-skeleton-search" />
        <div className="cc-skeleton-links">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cc-skeleton-pill" />
          ))}
        </div>
      </div>

      <div className="cc-skeleton-ticker cm-skeleton-ticker">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="cc-skeleton-ticker-item cm-skeleton-ticker-item" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-pulse cm-skeleton-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="cc-skeleton-pulse-cell" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-regime-grid">
        <div className="cc-skeleton-block cc-skeleton-regime" />
        <div className="cc-skeleton-block cc-skeleton-segments cm-skeleton-heatmap" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-panels-grid cc-skeleton-panels-grid--triple cm-skeleton-panels">
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-tmap cm-skeleton-treemap" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-intel" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-bottom-strip cm-skeleton-bottom-strip">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cc-skeleton-block cc-skeleton-bottom-panel" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-signal-rail cm-skeleton-signal-rail">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cc-skeleton-signal-card cm-skeleton-signal-card" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-screener" />
    </div>
  );
}
