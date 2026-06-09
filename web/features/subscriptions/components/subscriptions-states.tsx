import { EmptyState } from "@/components/states";

export function SubscriptionsPageSkeleton() {
  return (
    <div className="sub-studio sub-skeleton" aria-busy="true" aria-label="Üyelikler yükleniyor">
      <div className="sub-page sub-surface">
        <div className="sub-nav-segment">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sub-skeleton-tab motion-shimmer" />
          ))}
        </div>
        <div className="sub-panel">
          <div className="sub-skeleton-line motion-shimmer sub-skeleton-line--md" />
          <div className="sub-skeleton-line motion-shimmer sub-skeleton-line--lg" style={{ marginTop: 12 }} />
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <div className="sub-skeleton-avatar motion-shimmer" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="sub-skeleton-line motion-shimmer" />
              <div className="sub-skeleton-line motion-shimmer sub-skeleton-line--md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MembershipDetailSkeleton() {
  return (
    <div className="sub-studio sub-skeleton" aria-busy="true" aria-label="Üyelik detayı yükleniyor">
      <div className="sub-page sub-surface">
        <div className="sub-panel">
          <div style={{ display: "flex", gap: 14 }}>
            <div className="sub-skeleton-avatar motion-shimmer" style={{ width: 64, height: 64 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="sub-skeleton-line motion-shimmer" style={{ width: 80 }} />
              <div className="sub-skeleton-line motion-shimmer sub-skeleton-line--lg" />
            </div>
          </div>
          <div className="sub-skeleton-line motion-shimmer" style={{ marginTop: 24, width: "100%", height: 48 }} />
          <div className="sub-skeleton-line motion-shimmer" style={{ width: "100%", height: 120 }} />
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsHubShellSkeleton() {
  return <SubscriptionsPageSkeleton />;
}

export function SubscriptionsHubError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="sub-studio">
      <div className="sub-page sub-surface">
        <div className="sub-panel">
          <EmptyState
            title="Üyelikler yüklenemedi"
            description="Bağlantı veya sunucu hatası. Tekrar deneyebilir veya keşfet sayfasına gidebilirsin."
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
