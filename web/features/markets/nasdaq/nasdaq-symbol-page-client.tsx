"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "@/features/markets/nasdaq/symbol-detail/styles/index.css";

import { NasdaqDetailChartSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-chart-section";
import { NasdaqDetailFundamentalsSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-fundamentals-section";
import { NasdaqDetailHero } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-hero";
import { NasdaqDetailPeerComparisonSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-peer-comparison-section";
import { NasdaqDetailPulseSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-pulse-section";
import { NasdaqDetailSidebarRail } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-sidebar-rail";
import { NasdaqDetailTickerStrip } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-ticker";
import { NasdaqDetailAlertSheet } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-alert-sheet";
import { NasdaqDetailSignalsSection } from "@/features/markets/nasdaq/symbol-detail/components/nasdaq-detail-signals-section";
import { DetailCommunitySection } from "@/features/markets/crypto/symbol-detail/components/detail-community-section";
import { DetailMediaSection } from "@/features/markets/crypto/symbol-detail/components/detail-media-section";
import { DetailNewsSection } from "@/features/markets/crypto/symbol-detail/components/detail-news-section";
import { isBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import {
  nasdaqAccentFor,
  nasdaqAssetCategory,
  nasdaqPageClass,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { filterNasdaqAssets } from "@/features/markets/lib/live-category/live-category-shared";
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

function isNasdaqCategory(category: string): boolean {
  return category === "stocks" || category === "index";
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

export function NasdaqSymbolPageClient() {
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
  const assetCategory = inferMarketAssetCategory(decoded);
  const pageClass = symStable ? nasdaqPageClass(symStable) : "nqx-page--stock";
  const accent = symStable ? nasdaqAccentFor(symStable) : "#06b6d4";
  const hubPath = marketsHubPathForCategory(nasdaqAssetCategory(symStable || "AAPL"));
  const hubLabel = "NASDAQ piyasalar";

  useEffect(() => {
    if (!symStable) return;
    trackAssetView(symStable, "markets_nasdaq_symbol");
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
  const nasdaqAssets = useMemo(() => filterNasdaqAssets(assetPool), [assetPool]);
  const liveAsset = useMemo(
    () => nasdaqAssets.find((a) => a.symbol.trim().toUpperCase() === symStable) ?? null,
    [nasdaqAssets, symStable],
  );

  if (!decoded.trim()) {
    return (
      <EmptyBlock
        title="Geçersiz sembol"
        description="URL'de bir NASDAQ sembolü belirtin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (isBistSymbol(decoded)) {
    return (
      <EmptyBlock
        title="BIST sembolü"
        description="Bu sembol BIST kapsamındadır. BIST detay sayfasına yönlendiriliyor."
        actionLabel="BIST piyasalar"
        onAction={() => router.push(marketsHubPathForCategory("bist"))}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (!isNasdaqCategory(assetCategory)) {
    return (
      <EmptyBlock
        title="NASDAQ sembolü değil"
        description="Bu sayfa yalnızca US hisse ve endeks varlıkları içindir."
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
        description="Mock evrende bu NASDAQ sembolü tanımlı değil."
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
        description="NASDAQ kotasyonu hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (bundle.news.length > 0) sectionsRef.current.news = true;
  if (bundle.discussions.length > 0) sectionsRef.current.community = true;

  const sym = bundle.asset.symbol.trim().toUpperCase();
  const showNews = sectionsRef.current.news;
  const showCommunity = sectionsRef.current.community;

  return (
    <DetailShell accent={accent} className={pageClass}>
      <NasdaqDetailTickerStrip assets={nasdaqAssets} activeSymbol={sym} />

      <div className={cn("cdr-shell", !shellEntered && "cdr-shell--enter")}>
        <NasdaqDetailHero
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
            <NasdaqDetailChartSection bundle={bundle} liveAsset={liveAsset} />
            <DetailMainZoneDivider variant="peak-live" />
            <NasdaqDetailFundamentalsSection symbol={sym} name={bundle.asset.name} />
            <DetailMainZoneDivider variant="live-teal" />
            <NasdaqDetailPulseSection
              symbol={sym}
              changePct={liveAsset?.change_percent ?? bundle.asset.change_percent}
            />
            <DetailMainZoneDivider variant="live-teal" />
            <NasdaqDetailPeerComparisonSection symbol={sym} />
          </div>

          <NasdaqDetailSidebarRail
            bundle={bundle}
            nasdaqAssets={nasdaqAssets}
            liveAsset={liveAsset}
            settled={sidebarSettled}
          />
        </div>

        <div className="cdr-wide-band">
          <NasdaqDetailSignalsSection bundle={bundle} nasdaqAssets={nasdaqAssets} />
          {showNews ? <DetailNewsSection bundle={bundle} variant="wide" /> : null}
          <DetailMediaSection bundle={bundle} variant="wide" />
          {showCommunity ? <DetailCommunitySection bundle={bundle} variant="wide" /> : null}
        </div>
      </div>

      <NasdaqDetailAlertSheet
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
