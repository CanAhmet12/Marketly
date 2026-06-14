"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "@/features/markets/bist/symbol-detail/styles/index.css";

import { BistDetailChartSection } from "@/features/markets/bist/symbol-detail/components/bist-detail-chart-section";
import { BistDetailFundamentalsSection } from "@/features/markets/bist/symbol-detail/components/bist-detail-fundamentals-section";
import { BistDetailHero } from "@/features/markets/bist/symbol-detail/components/bist-detail-hero";
import { BistDetailPeerComparisonSection } from "@/features/markets/bist/symbol-detail/components/bist-detail-peer-comparison-section";
import { BistDetailPulseSection } from "@/features/markets/bist/symbol-detail/components/bist-detail-pulse-section";
import { BistDetailSidebarRail } from "@/features/markets/bist/symbol-detail/components/bist-detail-sidebar-rail";
import { BistDetailTickerStrip } from "@/features/markets/bist/symbol-detail/components/bist-detail-ticker";
import { BistDetailAlertSheet } from "@/features/markets/bist/symbol-detail/components/bist-detail-alert-sheet";
import {
  bistAccentFor,
  bistPageClass,
  isBistSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { BistDetailSignalsSection } from "@/features/markets/bist/symbol-detail/components/bist-detail-signals-section";
import { DetailCommunitySection } from "@/features/markets/crypto/symbol-detail/components/detail-community-section";
import { DetailMediaSection } from "@/features/markets/crypto/symbol-detail/components/detail-media-section";
import { DetailNewsSection } from "@/features/markets/crypto/symbol-detail/components/detail-news-section";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { filterBistAssets } from "@/features/markets/lib/live-category/live-category-shared";
import { marketsHubPathForCategory } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { DetailEmptyState } from "@/features/markets/symbol-detail-core/components/detail-empty-state";
import { DetailMainZoneDivider } from "@/features/markets/symbol-detail-core/components/detail-main-zone-divider";
import { DetailPageSkeleton } from "@/features/markets/symbol-detail-core/components/detail-page-skeleton";
import { DetailShell } from "@/features/markets/symbol-detail-core/components/detail-shell";
import { trackAssetView } from "@/features/personalization/tracking";
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

export function BistSymbolPageClient() {
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
  const symStable = normalizeBistSymbol(decoded) || "";
  const pageClass = symStable ? bistPageClass(symStable) : "bc-page--bist bc-page--stock";
  const accent = symStable ? bistAccentFor(symStable) : "#2563eb";
  const hubPath = marketsHubPathForCategory("bist");
  const hubLabel = "BIST piyasalar";

  useEffect(() => {
    if (!symStable) return;
    trackAssetView(symStable, "markets_bist_symbol");
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
  const bistAssets = useMemo(() => filterBistAssets(assetPool), [assetPool]);
  const liveAsset = useMemo(
    () => bistAssets.find((a) => normalizeBistSymbol(a.symbol) === symStable) ?? null,
    [bistAssets, symStable],
  );

  if (!decoded.trim()) {
    return (
      <EmptyBlock
        title="Geçersiz sembol"
        description="URL'de bir BIST sembolü belirtin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (!isBistSymbol(decoded)) {
    return (
      <EmptyBlock
        title="BIST sembolü değil"
        description="Bu sayfa yalnızca BIST hisse ve endeks varlıkları içindir."
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
        description="Mock evrende bu BIST sembolü tanımlı değil."
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
        description="BIST kotasyonu hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel={hubLabel}
        onAction={() => router.push(hubPath)}
        pageClass={pageClass}
        accent={accent}
      />
    );
  }

  if (bundle.news.length > 0) sectionsRef.current.news = true;
  if (bundle.discussions.length > 0) sectionsRef.current.community = true;

  const sym = normalizeBistSymbol(bundle.asset.symbol);
  const showNews = sectionsRef.current.news;
  const showCommunity = sectionsRef.current.community;

  return (
    <DetailShell accent={accent} className={pageClass}>
      <BistDetailTickerStrip assets={bistAssets} activeSymbol={sym} />

      <div className={cn("cdr-shell", !shellEntered && "cdr-shell--enter")}>
        <BistDetailHero
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
            <BistDetailChartSection bundle={bundle} liveAsset={liveAsset} />
            <DetailMainZoneDivider variant="peak-live" />
            <BistDetailFundamentalsSection symbol={sym} name={bundle.asset.name} />
            <DetailMainZoneDivider variant="live-teal" />
            <BistDetailPulseSection
              symbol={sym}
              changePct={liveAsset?.change_percent ?? bundle.asset.change_percent}
            />
            <DetailMainZoneDivider variant="live-teal" />
            <BistDetailPeerComparisonSection symbol={sym} />
          </div>

          <BistDetailSidebarRail
            bundle={bundle}
            bistAssets={bistAssets}
            liveAsset={liveAsset}
            settled={sidebarSettled}
          />
        </div>

        <div className="cdr-wide-band">
          <BistDetailSignalsSection bundle={bundle} bistAssets={bistAssets} />
          {showNews ? <DetailNewsSection bundle={bundle} variant="wide" /> : null}
          <DetailMediaSection bundle={bundle} variant="wide" />
          {showCommunity ? <DetailCommunitySection bundle={bundle} variant="wide" /> : null}
        </div>
      </div>

      <BistDetailAlertSheet
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
