"use client";

import { memo } from "react";

import { DetailRelatedAssetsSection } from "@/features/markets/crypto/symbol-detail/components/detail-related-assets-section";
import { DetailSidebarConsensus } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-consensus";
import { DetailSidebarDerivatives } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-derivatives";
import { DetailSidebarSentiment } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-sentiment";
import { DetailSidebarOrderBook } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-order-book";
import { DetailSidebarSummary } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-summary";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  bundle: AssetIntelligenceBundle;
  liveSummary: { change_percent: number; volume: string } | null;
  settled?: boolean;
};

function SidebarRailInner({ symbol, bundle, liveSummary, settled = false }: Props) {
  return (
    <aside className="cdr-sidebar-col cdr-sidebar-col--live">
      <div className={cn("cdr-sidebar-inner", settled && "cdr-sidebar-inner--settled")}>
        <DetailSidebarSummary bundle={bundle} liveSummary={liveSummary} />
        <DetailSidebarOrderBook symbol={symbol} />
        <DetailSidebarDerivatives symbol={symbol} />
        <DetailSidebarSentiment symbol={symbol} />
        <DetailSidebarConsensus bundle={bundle} />
        <DetailRelatedAssetsSection symbol={symbol} variant="sidebar" />
      </div>
    </aside>
  );
}

function railPropsEqual(prev: Props, next: Props): boolean {
  if (prev.symbol !== next.symbol) return false;
  if (prev.settled !== next.settled) return false;
  if (prev.bundle !== next.bundle) {
    const a = prev.bundle;
    const b = next.bundle;
    if (
      a.signalSummary.bullSharePct !== b.signalSummary.bullSharePct ||
      a.signalSummary.avgConfidenceActive !== b.signalSummary.avgConfidenceActive ||
      a.signalSummary.activeTotal !== b.signalSummary.activeTotal ||
      a.communitySurface.bullCommunityPct !== b.communitySurface.bullCommunityPct ||
      a.symbolConsensus.agreementPct !== b.symbolConsensus.agreementPct ||
      a.heroIntel.consensusDirection !== b.heroIntel.consensusDirection ||
      a.asset.marketCapLabel !== b.asset.marketCapLabel ||
      a.asset.volume !== b.asset.volume
    ) {
      return false;
    }
  }
  if (prev.liveSummary?.change_percent !== next.liveSummary?.change_percent) return false;
  if (prev.liveSummary?.volume !== next.liveSummary?.volume) return false;
  return true;
}

export const DetailSidebarRail = memo(SidebarRailInner, railPropsEqual);
