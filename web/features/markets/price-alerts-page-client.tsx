"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { HubButtonLink } from "@/features/hub/components/hub-button";
import { HubHeroStrip } from "@/features/hub/components/hub-hero-strip";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { useAuth } from "@/features/auth/use-auth";
import { usePriceAlertsPage } from "@/features/markets/hooks/use-price-alerts-page";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";

const LOGIN_NEXT = "/hub/price-alerts";

export function PriceAlertsPageClient() {
  const { user, isInitialized } = useAuth();
  const { grouped, totalCount, ready, loading, error, remove, refetch } = usePriceAlertsPage();

  const pageHeader = (
    <HubPageHeader
      kicker={hubPremiumKicker("finance", "Uyarılar")}
      title="Fiyat Alarmları"
      subtitle="Varlık sayfalarından eklediğiniz alarmlar burada toplanır. Bildirim tercihleri Ayarlar → Bildirimler bölümünden yönetilir."
      actions={
        <HubButtonLink href="/markets" variant="primary">
          Piyasalara Git
        </HubButtonLink>
      }
    />
  );

  if (!isInitialized || !ready || loading) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader}>
        <div className="pa-skeleton" aria-hidden />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Giriş gerekli"
          description="Fiyat alarmlarını yönetmek için oturum açın."
          actionLabel="Giriş yap"
          actionHref={`/auth/login?next=${encodeURIComponent(LOGIN_NEXT)}`}
          tone="market"
          compact
        />
      </HubPageShell>
    );
  }

  if (error) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Alarmlar yüklenemedi"
          description={error}
          actionLabel="Tekrar dene"
          onAction={() => void refetch()}
          tone="market"
          compact
        />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell
      zone="finance"
      className="pa-page"
      header={pageHeader}
      hero={
        <HubHeroStrip
          stats={[
            {
              label: "Aktif Alarm",
              value: totalCount,
              change: grouped.length > 0 ? `${grouped.length} sembol` : "Henüz yok",
              changeTone: "neutral",
              valueAccent: true,
            },
          ]}
        />
      }
    >
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
    </HubPageShell>
  );
}
