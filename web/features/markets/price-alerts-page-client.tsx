"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { usePriceAlertsPage } from "@/features/markets/hooks/use-price-alerts-page";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";

export function PriceAlertsPageClient() {
  const { user, isInitialized } = useAuth();
  const { grouped, totalCount, ready, loading, error, remove, refetch } = usePriceAlertsPage();

  if (!isInitialized || !ready || loading) {
    return (
      <div className="pa-page">
        <div className="pa-skeleton" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Giriş gerekli"
        description="Fiyat alarmlarını yönetmek için oturum açın."
        actionLabel="Giriş yap"
        actionHref="/auth/login"
        tone="market"
        compact
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Alarmlar yüklenemedi"
        description={error}
        actionLabel="Tekrar dene"
        onAction={() => void refetch()}
        tone="market"
        compact
      />
    );
  }

  return (
    <div className="pa-page">
      <header className="pa-header">
        <div>
          <p className="pa-kicker">Piyasa uyarıları</p>
          <h1 className="pa-title">Fiyat alarmları</h1>
          <p className="pa-sub">
            Varlık sayfalarından eklediğiniz alarmlar burada toplanır. Bildirim tercihleri Ayarlar → Bildirimler bölümünden yönetilir.
          </p>
        </div>
        <div className="pa-stat">
          <span className="pa-stat-val">{totalCount}</span>
          <span className="pa-stat-label">aktif alarm</span>
        </div>
      </header>

      {grouped.length === 0 ? (
        <EmptyState
          title="Henüz alarm yok"
          description="Bir varlık sayfasında Fiyat Alarmı bölümünden hazır şablon ekleyerek başlayın."
          actionLabel="Piyasalara git"
          actionHref="/markets"
          tone="market"
          compact
        />
      ) : (
        <div className="pa-groups">
          {grouped.map((g) => (
            <section key={g.symbol} className="pa-group">
              <div className="pa-group-head">
                <Link href={`/markets/${encodeURIComponent(g.symbol)}`} className="pa-symbol">
                  {g.symbol}
                </Link>
                <span className="pa-group-count">{g.alerts.length} alarm</span>
              </div>
              <ul className="pa-list">
                {g.alerts.map((a) => (
                  <li key={a.id} className="pa-row">
                    <div className="pa-row-body">
                      <span className="pa-row-label">{a.label}</span>
                      <span className="pa-row-time">{formatSocialRelativeTime(a.createdAt)}</span>
                    </div>
                    <button
                      type="button"
                      className="pa-remove"
                      disabled={remove.isPending}
                      onClick={() => void remove.mutateAsync({ id: a.id, symbol: a.symbol, source: a.source })}
                    >
                      Kaldır
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
