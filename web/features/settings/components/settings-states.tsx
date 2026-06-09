"use client";

import type { ReactNode } from "react";

export function SettingsPageSkeleton() {
  return (
    <div className="stg-studio stg-skeleton" aria-busy="true" aria-label="Ayarlar yükleniyor">
      <div className="stg-skeleton-page stg-surface">
        <div className="stg-skeleton-segment">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="stg-skeleton-tab motion-shimmer" />
          ))}
        </div>

        <div className="stg-skeleton-panel">
          <div className="stg-skeleton-head">
            <div className="stg-skeleton-title motion-shimmer" />
            <div className="stg-skeleton-desc motion-shimmer" />
          </div>
          <div className="stg-skeleton-cards">
            <div className="stg-skeleton-card motion-shimmer" />
            <div className="stg-skeleton-card motion-shimmer" />
            <div className="stg-skeleton-card motion-shimmer" />
            <div className="stg-skeleton-card motion-shimmer" />
            <div className="stg-skeleton-card stg-skeleton-card--wide motion-shimmer" />
          </div>
          <div className="stg-skeleton-block motion-shimmer" />
        </div>
      </div>
    </div>
  );
}

/** Panel içi tercihler hydrate olurken */
export function SettingsSectionSkeleton() {
  return (
    <div className="stg-section-fallback" aria-busy="true" aria-label="Bölüm yükleniyor">
      <div className="stg-skeleton-head">
        <div className="stg-skeleton-title motion-shimmer" />
        <div className="stg-skeleton-desc motion-shimmer" />
      </div>
      <div className="stg-skeleton-cards">
        <div className="stg-skeleton-card motion-shimmer" />
        <div className="stg-skeleton-card motion-shimmer" />
      </div>
      <div className="stg-skeleton-block motion-shimmer" />
    </div>
  );
}

/** Oturum yok — stg shell içinde EmptyState companion */
export function SettingsUnauthShell({ children }: { children: ReactNode }) {
  return (
    <div className="stg-studio">
      <div className="stg-page">
        <div className="stg-unauth-wrap">{children}</div>
      </div>
    </div>
  );
}
