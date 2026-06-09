"use client";

import { HubButtonLink } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";

export function PriceAlertsPageHeader() {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("finance", "Uyarılar")}
      title="Fiyat Alarmları"
      subtitle="Varlık sayfalarından eklediğiniz eşikler burada toplanır. Bildirim tercihleri Ayarlar → Bildirimler bölümünden yönetilir."
      actions={
        <>
          <HubButtonLink href="/hub/watchlist">Takip listem</HubButtonLink>
          <HubButtonLink href={MARKETS_HUB_PATH} variant="primary">
            Piyasalara git
          </HubButtonLink>
        </>
      }
    />
  );
}
