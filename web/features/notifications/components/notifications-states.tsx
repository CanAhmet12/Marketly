import { EmptyState } from "@/components/states";

export function NotificationsPageSkeleton() {
  return (
    <div className="ntf-studio ntf-skeleton" aria-busy="true" aria-label="Bildirimler yükleniyor">
      <div className="ntf-page ntf-surface">
        <div className="ntf-nav-segment">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="ntf-skeleton-tab motion-shimmer" />
          ))}
        </div>
        <div className="ntf-panel">
          <div className="ntf-skeleton-line motion-shimmer ntf-skeleton-line--md" />
          <div className="ntf-intel-grid" style={{ marginTop: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ntf-skeleton-line motion-shimmer" style={{ height: 52, borderRadius: 10 }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div className="ntf-skeleton-avatar motion-shimmer" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="ntf-skeleton-line motion-shimmer" />
                <div className="ntf-skeleton-line motion-shimmer ntf-skeleton-line--lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationsHubError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="ntf-studio">
      <div className="ntf-page ntf-surface">
        <div className="ntf-panel">
          <EmptyState
            title="Yüklenemedi"
            description="Bildirim merkezi yüklenemedi. Tekrar deneyebilir veya ayarlara gidebilirsin."
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
