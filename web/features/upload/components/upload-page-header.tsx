"use client";

import { HubButtonLink } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

/** Portföy `PortfolioPageHeader` ile aynı kabuk — HubPageHeader + zone kicker + aksiyonlar */
export function UploadPageHeader() {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("tools", "Yayın")}
      title="İçerik Oluştur"
      actions={
        <>
          <HubButtonLink href="/hub/studio/drafts">Taslaklar</HubButtonLink>
          <HubButtonLink href="/hub/studio">Creator Studio</HubButtonLink>
        </>
      }
    />
  );
}
