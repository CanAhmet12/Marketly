"use client";

export function CryptoCategoryPageSkeleton() {
  return (
    <div className="cc-skeleton" aria-busy="true" aria-label="Kripto sayfası yükleniyor">
      <div className="cc-skeleton-toolbar">
        <div className="cc-skeleton-block cc-skeleton-search" />
        <div className="cc-skeleton-links">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="cc-skeleton-pill" />
          ))}
        </div>
      </div>

      <div className="cc-skeleton-ticker">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="cc-skeleton-ticker-item" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="cc-skeleton-pulse-cell" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-regime-grid">
        <div className="cc-skeleton-block cc-skeleton-regime" />
        <div className="cc-skeleton-block cc-skeleton-segments" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-panels-grid cc-skeleton-panels-grid--triple">
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
        <div className="cc-skeleton-block cc-skeleton-panel" />
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-tmap" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-intel" />

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-signal-rail">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cc-skeleton-signal-card" />
        ))}
      </div>

      <div className="cc-divider" aria-hidden />

      <div className="cc-skeleton-block cc-skeleton-screener" />
    </div>
  );
}
