"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "@/features/markets/commodities/symbol-detail/styles/index.css";

import { CommodityDetailChartSection } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-chart-section";
import { CommodityDetailFundamentalsSection } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-fundamentals-section";
import { CommodityDetailHero } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-hero";
import { CommodityDetailPulseSection } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-pulse-section";
import { CommodityDetailVenueComparisonSection } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-venue-comparison-section";
import { CommodityDetailSidebarRail } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-sidebar-rail";
import { CommodityDetailTickerStrip } from "@/features/markets/commodities/symbol-detail/components/commodity-detail-ticker";
import { DetailAlertSheet } from "@/features/markets/crypto/symbol-detail/components/detail-alert-sheet";
import { DetailCommunitySection } from "@/features/markets/crypto/symbol-detail/components/detail-community-section";
import { DetailMediaSection } from "@/features/markets/crypto/symbol-detail/components/detail-media-section";
import { DetailNewsSection } from "@/features/markets/crypto/symbol-detail/components/detail-news-section";
import { DetailSignalsSection } from "@/features/markets/crypto/symbol-detail/components/detail-signals-section";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { marketsHubPathForCategory } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { filterCommodityAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { DetailEmptyState } from "@/features/markets/symbol-detail-core/components/detail-empty-state";
import { DetailMainZoneDivider } from "@/features/markets/symbol-detail-core/components/detail-main-zone-divider";
import { DetailPageSkeleton } from "@/features/markets/symbol-detail-core/components/detail-page-skeleton";
import { DetailShell } from "@/features/markets/symbol-detail-core/components/detail-shell";
import { detailCategoryAccent } from "@/features/markets/symbol-detail-core/lib/category-meta";
import { trackAssetView } from "@/features/personalization/tracking";
import { inferMarketAssetCategory } from "@/lib/market-category";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

function decodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function EmptyBlock({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <DetailShell accent={detailCategoryAccent("commodity")} className="cmr-page--commodity">
      <DetailEmptyState
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </DetailShell>
  );
}

export function CommoditiesSymbolPageClient() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const mockOn = isMockDataEnabled();
  const repo = useMemo(() => getMarketsRepository(), []);
  const [shellEntered, setShellEntered] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [sidebarSettled, setSidebarSettled] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const sectionsRef = useRef({ news: false, community: false });

  const raw = typeof params?.symbol === "string" ? params.symbol : "";
  const decoded = useMemo(() => decodeParam(raw), [raw]);
  const symStable = decoded.trim().toUpperCase() || "";

  useEffect(() => {
    if (!symStable) return;
    trackAssetView(symStable, "markets_commodity_symbol");
  }, [symStable]);

  const { bundle, isLoading } = useAssetIntelligence(decoded);
  const { assets: liveAssets } = useMarketAssetsLive();
  const { toggleWatch, isWatched } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);
  const { inPortfolio, togglePortfolio, alerts, addPresetAlert, removeAlert } =
    useAssetDetailLocalMocks(symStable);

  useEffect(() => {
    if (bundle) setPageReady(true);
  }, [bundle]);

  useEffect(() => {
    if (!pageReady || shellEntered) return;
    const id = window.setTimeout(() => setShellEntered(true), 700);
    return () => window.clearTimeout(id);
  }, [pageReady, shellEntered]);

  useEffect(() => {
    if (!pageReady || sidebarSettled) return;
    const id = window.setTimeout(() => setSidebarSettled(true), 900);
    return () => window.clearTimeout(id);
  }, [pageReady, sidebarSettled]);

  const dashboard = useMemo(() => repo.getDashboardPayload(), [repo]);
  const assetPool = mockOn ? (dashboard?.assets ?? []) : liveAssets;
  const commodityAssets = useMemo(() => filterCommodityAssets(assetPool), [assetPool]);
  const liveAsset = useMemo(
    () => commodityAssets.find((a) => a.symbol.trim().toUpperCase() === symStable) ?? null,
    [commodityAssets, symStable],
  );

  const hubPath = marketsHubPathForCategory("commodity");
  const hubLabel = "Emtia piyasalar";

  if (!decoded.trim()) {
    return (
      <EmptyBlock
        title="Geçersiz sembol"
        description="URL'de bir emtia sembolü belirtin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
      />
    );
  }

  if (inferMarketAssetCategory(decoded) !== "commodity") {
    return (
      <EmptyBlock
        title="Emtia sembolü değil"
        description="Bu sayfa yalnızca emtia varlıkları içindir."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
      />
    );
  }

  if (mockOn && !bundle) {
    return (
      <EmptyBlock
        title="Sembol bulunamadı"
        description="Mock evrende bu emtia sembolü tanımlı değil."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
      />
    );
  }

  if (!bundle) {
    if (!mockOn && isLoading && !pageReady) {
      return (
        <DetailShell accent={detailCategoryAccent("commodity")} className="cmr-page--commodity">
          <DetailPageSkeleton />
        </DetailShell>
      );
    }
    return (
      <EmptyBlock
        title="Veri yüklenemedi"
        description="Emtia kotasyonu hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
      />
    );
  }

  if (bundle.news.length > 0) sectionsRef.current.news = true;
  if (bundle.discussions.length > 0) sectionsRef.current.community = true;

  const sym = bundle.asset.symbol.trim().toUpperCase();
  const showNews = sectionsRef.current.news;
  const showCommunity = sectionsRef.current.community;

  return (
    <DetailShell accent={detailCategoryAccent("commodity")} className="cmr-page--commodity">
      <CommodityDetailTickerStrip assets={commodityAssets} activeSymbol={sym} />

      <div className={cn("cdr-shell", !shellEntered && "cdr-shell--enter")}>
        <CommodityDetailHero
          bundle={bundle}
          liveAsset={liveAsset}
          watched={isWatched(sym)}
          inPortfolio={inPortfolio}
          alertCount={alerts.length}
          onToggleWatch={() => toggleWatch(sym)}
          onTogglePortfolio={togglePortfolio}
          onOpenAlerts={() => setAlertsOpen(true)}
        />

        <div className="cdr-main-grid">
          <div className="cdr-main-col">
            <CommodityDetailChartSection bundle={bundle} liveAsset={liveAsset} />
            <DetailMainZoneDivider variant="peak-live" />
            <CommodityDetailFundamentalsSection symbol={sym} name={bundle.asset.name} />
            <DetailMainZoneDivider variant="live-teal" />
            <CommodityDetailPulseSection
              symbol={sym}
              changePct={liveAsset?.change_percent ?? bundle.asset.change_percent}
            />
            <DetailMainZoneDivider variant="live-teal" />
            <CommodityDetailVenueComparisonSection symbol={sym} />
          </div>

          <CommodityDetailSidebarRail
            bundle={bundle}
            commodityAssets={commodityAssets}
            settled={sidebarSettled}
          />
        </div>

        <div className="cdr-wide-band">
          <DetailSignalsSection bundle={bundle} variant="wide" />
          {showNews ? <DetailNewsSection bundle={bundle} variant="wide" /> : null}
          <DetailMediaSection bundle={bundle} variant="wide" />
          {showCommunity ? <DetailCommunitySection bundle={bundle} variant="wide" /> : null}
        </div>
      </div>

      <DetailAlertSheet
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        symbol={sym}
        price={bundle.asset.price}
        alerts={alerts}
        onAdd={addPresetAlert}
        onRemove={removeAlert}
      />
    </DetailShell>
  );
}
