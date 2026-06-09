import { EmptyState } from "@/components/states";

export function CloseFriendsPageSkeleton() {
  return (
    <div className="cf-studio cf-skeleton" aria-busy="true" aria-label="Yakın arkadaşlar yükleniyor">
      <div className="cf-page cf-surface">
        <div className="cf-nav-segment">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="cf-skeleton-tab motion-shimmer" />
          ))}
        </div>
        <div className="cf-panel">
          <div className="cf-skeleton-line motion-shimmer cf-skeleton-line--md" />
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <div className="cf-skeleton-avatar motion-shimmer" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="cf-skeleton-line motion-shimmer" />
              <div className="cf-skeleton-line motion-shimmer cf-skeleton-line--md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CircleDetailSkeleton() {
  return (
    <div className="cf-studio cf-skeleton" aria-busy="true" aria-label="Daire detayı yükleniyor">
      <div className="cf-page cf-surface">
        <div className="cf-panel">
          <div style={{ display: "flex", gap: 14 }}>
            <div className="cf-skeleton-avatar motion-shimmer" style={{ width: 56, height: 56 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="cf-skeleton-line motion-shimmer" style={{ width: 80 }} />
              <div className="cf-skeleton-line motion-shimmer cf-skeleton-line--lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CloseFriendsHubError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="cf-studio">
      <div className="cf-page cf-surface">
        <div className="cf-panel">
          <EmptyState
            title="Yüklenemedi"
            description="Bağlantı hatası. Tekrar deneyebilir veya ayarlara gidebilirsin."
            actionLabel={onRetry ? "Tekrar dene" : undefined}
            onAction={onRetry}
            secondaryActionLabel="Ayarlar"
            secondaryActionHref="/hub/settings"
            tone="social"
          />
        </div>
      </div>
    </div>
  );
}
