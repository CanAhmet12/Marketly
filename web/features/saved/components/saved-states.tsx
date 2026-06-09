import { EmptyState } from "@/components/states";

export function SavedPageSkeleton() {
  return (
    <div className="sv-studio sv-skeleton" aria-busy="true" aria-label="Kaydedilenler yükleniyor">
      <div className="sv-page sv-surface">
        <div className="sv-nav-segment">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sv-skeleton-tab motion-shimmer" />
          ))}
        </div>
        <div className="sv-panel">
          <div className="sv-skeleton-line motion-shimmer sv-skeleton-line--md" />
          <div className="sv-intel-grid" style={{ marginTop: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sv-skeleton-line motion-shimmer" style={{ height: 52, borderRadius: 10 }} />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div className="sv-skeleton-avatar motion-shimmer" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="sv-skeleton-line motion-shimmer" />
                <div className="sv-skeleton-line motion-shimmer sv-skeleton-line--lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SavedHubError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="sv-studio">
      <div className="sv-page sv-surface">
        <div className="sv-panel">
          <EmptyState
            title="Kayıtlar yüklenemedi"
            description={message ?? "Bağlantı hatası. Tekrar deneyebilirsin."}
            actionLabel={onRetry ? "Tekrar dene" : undefined}
            onAction={onRetry}
            secondaryActionLabel="Keşfet"
            secondaryActionHref="/discover"
            tone="social"
          />
        </div>
      </div>
    </div>
  );
}
