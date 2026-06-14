"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import "@/features/markets/crypto/symbol-detail/styles/index.css";

import { DetailAlertSheet } from "@/features/markets/crypto/symbol-detail/components/detail-alert-sheet";
import { DetailLiveTickerStrip } from "@/features/markets/crypto/symbol-detail/components/detail-live-ticker";
import { DetailChartSection } from "@/features/markets/crypto/symbol-detail/components/detail-chart-section";
import { DetailCommunitySection } from "@/features/markets/crypto/symbol-detail/components/detail-community-section";
import { DetailHero } from "@/features/markets/crypto/symbol-detail/components/detail-hero";
import { DetailMediaSection } from "@/features/markets/crypto/symbol-detail/components/detail-media-section";
import { DetailNewsSection } from "@/features/markets/crypto/symbol-detail/components/detail-news-section";
import { DetailEmptyState } from "@/features/markets/symbol-detail-core/components/detail-empty-state";
import { DetailPageSkeleton } from "@/features/markets/crypto/symbol-detail/components/detail-page-skeleton";
import { DetailShell } from "@/features/markets/crypto/symbol-detail/components/detail-shell";
import { DetailSidebarRail } from "@/features/markets/crypto/symbol-detail/components/detail-sidebar-rail";
import { DetailSignalsSection } from "@/features/markets/crypto/symbol-detail/components/detail-signals-section";
import { DetailMainZoneDivider } from "@/features/markets/crypto/symbol-detail/components/detail-main-zone-divider";
import { DetailMarketPulseSection } from "@/features/markets/crypto/symbol-detail/components/detail-market-pulse-section";
import { DetailMarketsComparisonSection } from "@/features/markets/crypto/symbol-detail/components/detail-markets-comparison-section";
import { DetailTokenomicsSection } from "@/features/markets/crypto/symbol-detail/components/detail-tokenomics-section";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { marketsCategoryPath } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
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
    <DetailShell>
      <DetailEmptyState
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </DetailShell>
  );
}

export function CryptoSymbolPageClient() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const mockOn = isMockDataEnabled();
  const repo = useMemo(() => getMarketsRepository(), []);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const raw = typeof params?.symbol === "string" ? params.symbol : "";
  const decoded = useMemo(() => decodeParam(raw), [raw]);
  const symStable = decoded.trim().toUpperCase() || "";
  const [pageReady, setPageReady] = useState(false);
  const [shellEntered, setShellEntered] = useState(false);
  const [sidebarSettled, setSidebarSettled] = useState(false);
  const sectionsRef = useRef({ news: false, community: false });

  const { bundle, isLoading } = useAssetIntelligence(decoded);
  const { assets: liveAssets } = useMarketAssetsLive();

  useEffect(() => {
    if (!symStable) return;
    trackAssetView(symStable, "markets_crypto_symbol");
  }, [symStable]);

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
  const tickerAssets = mockOn ? (dashboard?.assets ?? []) : liveAssets;
  const liveAsset = useMemo(
    () => tickerAssets.find((a) => a.symbol.trim().toUpperCase() === symStable) ?? null,
    [tickerAssets, symStable],
  );
  const liveSummary = useMemo(
    () =>
      liveAsset
        ? { change_percent: liveAsset.change_percent, volume: liveAsset.volume }
        : null,
    [liveAsset?.change_percent, liveAsset?.volume],
  );
  const { toggleWatch, isWatched } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);
  const { inPortfolio, togglePortfolio, alerts, addPresetAlert, removeAlert } =
    useAssetDetailLocalMocks(symStable);

  if (!decoded.trim()) {
    return (
      <EmptyBlock
        title="Geçersiz sembol"
        description="URL'de bir kripto sembolü belirtin."
        actionLabel="Kripto piyasalar"
        onAction={() => router.push(marketsCategoryPath("crypto"))}
      />
    );
  }

  if (inferMarketAssetCategory(decoded) !== "crypto") {
    return (
      <EmptyBlock
        title="Kripto sembolü değil"
        description="Bu sayfa yalnızca kripto varlıklar içindir."
        actionLabel="Kripto piyasalar"
        onAction={() => router.push(marketsCategoryPath("crypto"))}
      />
    );
  }

  if (mockOn && !bundle) {
    return (
      <EmptyBlock
        title="Sembol bulunamadı"
        description="Mock evrende bu kripto sembolü tanımlı değil."
        actionLabel="Kripto piyasalar"
        onAction={() => router.push(marketsCategoryPath("crypto"))}
      />
    );
  }

  if (!bundle) {
    if (!mockOn && isLoading && !pageReady) {
      return (
        <DetailShell symbol={symStable || "BTC"}>
          <DetailPageSkeleton />
        </DetailShell>
      );
    }
    return (
      <EmptyBlock
        title="Veri yüklenemedi"
        description="Kripto kotasyonu hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
        actionLabel="Kripto piyasalar"
        onAction={() => router.push(marketsCategoryPath("crypto"))}
      />
    );
  }

  if (bundle.news.length > 0) sectionsRef.current.news = true;
  if (bundle.discussions.length > 0) sectionsRef.current.community = true;

  const sym = bundle.asset.symbol.trim().toUpperCase();
  const showNews = sectionsRef.current.news;
  const showCommunity = sectionsRef.current.community;

  return (
    <DetailShell symbol={sym}>
      <DetailLiveTickerStrip assets={tickerAssets} activeSymbol={sym} />

      <div className={cn("cdr-shell", !shellEntered && "cdr-shell--enter")}>
        <DetailHero
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
            <DetailChartSection bundle={bundle} />
            <DetailTokenomicsSection symbol={sym} variant="inline" />
            <DetailMainZoneDivider variant="peak-live" />
            <DetailMarketPulseSection symbol={sym} variant="inline" />
            <DetailMainZoneDivider variant="live-teal" />
            <DetailMarketsComparisonSection symbol={sym} variant="inline" />
          </div>

          <DetailSidebarRail
            symbol={sym}
            bundle={bundle}
            liveSummary={liveSummary}
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
