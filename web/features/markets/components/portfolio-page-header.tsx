"use client";

import { PortfolioShareCard } from "@/features/markets/components/portfolio-share-card";
import { HubButton, HubButtonLink } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";

type Props = {
  pageTitle: string;
  canAddHolding?: boolean;
  onAddHolding?: () => void;
  shareStats?: PortfolioLiveStats;
  shareHoldings?: PortfolioIntelligenceBundle["holdings"];
};

export function PortfolioPageHeader({
  pageTitle,
  canAddHolding,
  onAddHolding,
  shareStats,
  shareHoldings,
}: Props) {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("finance", "Yatırım")}
      title={pageTitle}
      actions={
        <>
          {canAddHolding && onAddHolding ? (
            <HubButton type="button" variant="primary" onClick={onAddHolding}>
              + Pozisyon Ekle
            </HubButton>
          ) : null}
          <HubButtonLink href="/hub/watchlist">İzleme Listesi</HubButtonLink>
          <HubButtonLink href="/signals">Sinyaller</HubButtonLink>
          {shareStats && shareHoldings?.length ? (
            <PortfolioShareCard stats={shareStats} holdings={shareHoldings} compact />
          ) : null}
        </>
      }
    />
  );
}
