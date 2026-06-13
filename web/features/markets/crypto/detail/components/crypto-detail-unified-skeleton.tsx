"use client";

/** `/markets/[symbol]` — kripto detay v3 unified Suspense fallback */
export function CryptoDetailUnifiedSkeleton() {
  return (
    <div
      className="crypto-canvas crypto-detail-canvas crypto-detail-unified ms-page-wrapper min-w-0 min-h-screen"
      aria-busy="true"
      aria-label="Kripto detay yükleniyor"
    >
      <div className="ms-container-markets min-w-0 pb-20 pt-4">
        <div className="cd-unified-shell">
          <div className="cd-page-chrome-skeleton">
            <div className="cd-skeleton-block cd-breadcrumb-skeleton" />
            <div className="cd-chrome-nav-skeleton">
              <span className="cd-skeleton-block" />
              <span className="cd-skeleton-block" />
              <span className="cd-skeleton-block" />
            </div>
          </div>

          <header className="cd-hero cd-hero-unified cd-hero--skeleton">
            <div className="cd-hero-unified-top">
              <div className="cd-hero-unified-identity">
                <div className="cd-skeleton-block cd-skeleton-logo" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="cd-skeleton-block cd-skeleton-badge-row" />
                  <div className="cd-skeleton-block cd-skeleton-title" />
                  <div className="cd-skeleton-block cd-skeleton-subtitle" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <div className="cd-skeleton-block cd-skeleton-price-label" />
                <div className="cd-skeleton-block cd-skeleton-price" />
              </div>
            </div>
            <div className="cd-skeleton-metrics">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cd-skeleton-block cd-skeleton-metric" />
              ))}
            </div>
          </header>

          <hr className="cd-unified-rule cd-unified-rule--major" />

          <div className="cd-unified-stage">
            <div className="cd-unified-stage-main">
              <div className="cd-skeleton-block cd-skeleton-chart--featured" />
              <div className="cd-skeleton-block" style={{ height: 120, margin: "0 16px" }} />
            </div>
            <div className="cd-skeleton-block" style={{ minHeight: 320, margin: "0 16px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
