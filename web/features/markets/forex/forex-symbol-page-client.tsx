"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "@/features/markets/forex/symbol-detail/styles/index.css";

import { ForexDetailChartSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-chart-section";
import { ForexDetailHero } from "@/features/markets/forex/symbol-detail/components/forex-detail-hero";
import { ForexDetailCrossPairSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-cross-pair-section";
import { ForexDetailMacroRatesSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-macro-rates-section";
import { ForexDetailPulseSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-pulse-section";
import { ForexDetailSidebarRail } from "@/features/markets/forex/symbol-detail/components/forex-detail-sidebar-rail";
import { ForexDetailTickerStrip } from "@/features/markets/forex/symbol-detail/components/forex-detail-ticker";
import { ForexDetailAlertSheet } from "@/features/markets/forex/symbol-detail/components/forex-detail-alert-sheet";
import { DetailCommunitySection } from "@/features/markets/crypto/symbol-detail/components/detail-community-section";
import { DetailMediaSection } from "@/features/markets/crypto/symbol-detail/components/detail-media-section";
import { DetailNewsSection } from "@/features/markets/crypto/symbol-detail/components/detail-news-section";
import { ForexDetailSignalsSection } from "@/features/markets/forex/symbol-detail/components/forex-detail-signals-section";
import {
  forexAccentFor,
  forexPageClass,
  normalizeForexSymbol,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { filterForexAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { marketsHubPathForCategory } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { DetailEmptyState } from "@/features/markets/symbol-detail-core/components/detail-empty-state";
import { DetailMainZoneDivider } from "@/features/markets/symbol-detail-core/components/detail-main-zone-divider";
import { DetailPageSkeleton } from "@/features/markets/symbol-detail-core/components/detail-page-skeleton";
import { DetailShell } from "@/features/markets/symbol-detail-core/components/detail-shell";
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
  pageClass,
  accent,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  pageClass: string;
  accent: string;
}) {
  return (
    <DetailShell accent={accent} className={pageClass}>
      <DetailEmptyState
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </DetailShell>
  );
}

export function ForexSymbolPageClient() {
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
  const symStable = decoded.trim().toUpperCase().replace("/", "") || "";
  const assetCategory = inferMarketAssetCategory(decoded);
  const pageClass = forexPageClass(symStable || "EURUSD");
  const accent = forexAccentFor(symStable || "EURUSD");
  const hubPath = marketsHubPathForCategory("forex");
  const hubLabel = "Forex piyasalar";

  useEffect(() => {
    if (!symStable) return;
    trackAssetView(symStable, "markets_forex_symbol");
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
  const forexAssets = useMemo(() => filterForexAssets(assetPool), [assetPool]);
  const liveAsset = useMemo(
    () => forexAssets.find((a) => a.symbol.trim().toUpperCase().replace("/", "") === symStable) ?? null,
    [forexAssets, symStable],
  );

  if (!decoded.trim()) {
    return (
      <EmptyBlock
        title="Geçersiz sembol"
        description="URL'de bir forex paritesi belirtin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (assetCategory !== "forex") {
    return (
      <EmptyBlock
        title="Forex paritesi değil"
        description="Bu sayfa yalnızca döviz pariteleri içindir."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (mockOn && !bundle) {
    return (
      <EmptyBlock
        title="Sembol bulunamadı"
        description="Mock evrende bu forex paritesi tanımlı değil."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (!bundle) {
    if (!mockOn && isLoading && !pageReady) {
      return (
        <DetailShell accent={accent} className={pageClass}>
          <DetailPageSkeleton />
        </DetailShell>
      );
    }
    return (
      <EmptyBlock
        title="Veri yüklenemedi"
        description="Forex kotasyonu hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (bundle.news.length > 0) sectionsRef.current.news = true;
  if (bundle.discussions.length > 0) sectionsRef.current.community = true;

  const sym = normalizeForexSymbol(bundle.asset.symbol);
  const showNews = sectionsRef.current.news;
  const showCommunity = sectionsRef.current.community;

  return (
    <DetailShell accent={accent} className={pageClass}>
      <ForexDetailTickerStrip assets={forexAssets} activeSymbol={sym} />

      <div className={cn("cdr-shell", !shellEntered && "cdr-shell--enter")}>
        <ForexDetailHero
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
            <ForexDetailChartSection bundle={bundle} liveAsset={liveAsset} />
            <DetailMainZoneDivider variant="peak-live" />
            <ForexDetailMacroRatesSection symbol={sym} />
            <DetailMainZoneDivider variant="live-teal" />
            <ForexDetailPulseSection
              symbol={sym}
              changePct={liveAsset?.change_percent ?? bundle.asset.change_percent}
            />
            <DetailMainZoneDivider variant="live-teal" />
            <ForexDetailCrossPairSection symbol={sym} />
          </div>

          <ForexDetailSidebarRail
            bundle={bundle}
            forexAssets={forexAssets}
            liveAsset={liveAsset}
            settled={sidebarSettled}
          />
        </div>

        <div className="cdr-wide-band">
          <ForexDetailSignalsSection bundle={bundle} forexAssets={forexAssets} />
          {showNews ? <DetailNewsSection bundle={bundle} variant="wide" /> : null}
          <DetailMediaSection bundle={bundle} variant="wide" />
          {showCommunity ? <DetailCommunitySection bundle={bundle} variant="wide" /> : null}
        </div>
      </div>

      <ForexDetailAlertSheet
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        symbol={sym}
        price={liveAsset?.price ?? bundle.asset.price}
        alerts={alerts}
        onAdd={addPresetAlert}
        onRemove={removeAlert}
      />
    </DetailShell>
  );
}
