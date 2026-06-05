"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { AssetDetailAlertSheet }        from "@/features/markets/components/asset-detail/asset-detail-alert-sheet";
import { AssetDetailChartWorkbench }    from "@/features/markets/components/asset-detail/asset-detail-chart-workbench";
import { AssetDetailHero }              from "@/features/markets/components/asset-detail/asset-detail-hero";
import { AssetDetailSignalIntelligence } from "@/features/markets/components/asset-detail/asset-detail-signal-intelligence";
import { AssetDetailNewsCalendar }      from "@/features/markets/components/asset-detail/asset-detail-news-calendar";
import { AssetDetailStatsMatrix }       from "@/features/markets/components/asset-detail/asset-detail-stats-matrix";
import { AssetDetailSideRail }          from "@/features/markets/components/asset-detail/asset-detail-side-rail";
import { AssetDetailCommunityTabs }     from "@/features/markets/components/asset-detail/asset-detail-community-tabs";
import { EmptyState }                   from "@/components/states";
import { usePrefersReducedMotion }      from "@/hooks/use-prefers-reduced-motion";
import { runViewTransition }            from "@/lib/navigation/view-transition";
import { useAssetDetailLocalMocks }     from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useMarketAssetsLive }          from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist }          from "@/features/markets/hooks/use-markets-watchlist";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { trackAssetView }               from "@/features/personalization/tracking";
import { isMockDataEnabled }            from "@/mock/config";

/** Varlık kategorisine göre accent rengi */
function categoryAccentColor(category: string): string {
  switch (category) {
    case "crypto":    return "#f59e0b";  /* BTC gold */
    case "stocks":    return "#06b6d4";  /* NASDAQ cyan */
    case "forex":     return "#8b5cf6";  /* violet */
    case "commodity": return "#f97316";  /* amber */
    case "index":     return "#3b82f6";  /* blue */
    default:          return "#0f9d75";  /* primary green */
  }
}

export function MarketSymbolPageClient() {
  const params   = useParams<{ symbol: string }>();
  const router   = useRouter();
  const mockOn   = isMockDataEnabled();
  const reduceMotion = usePrefersReducedMotion();
  const repo     = useMemo(() => getMarketsRepository(), []);

  const raw = typeof params?.symbol === "string" ? params.symbol : "";
  const decoded = useMemo(() => {
    try { return decodeURIComponent(raw); } catch { return raw; }
  }, [raw]);

  const symStable = decoded.trim().toUpperCase() || "UNKNOWN";

  useEffect(() => {
    if (!decoded.trim()) return;
    trackAssetView(symStable, "markets_symbol");
  }, [symStable, decoded]);

  const baseBundle = useMemo(() => {
    const s = decoded.trim();
    if (!s) return null;
    return repo.getAssetIntelligenceBundle(s);
  }, [repo, decoded]);

  const { assets: liveAssets } = useMarketAssetsLive();
  const bundle = useMemo(() => {
    if (!baseBundle || mockOn) return baseBundle;
    const live = liveAssets.find((a) => a.symbol.toUpperCase() === symStable);
    if (!live || live.price <= 0) return baseBundle;
    const trend: "flat" | "up" | "down" =
      live.change_percent > 0 ? "up" : live.change_percent < 0 ? "down" : "flat";
    return {
      ...baseBundle,
      asset: {
        ...baseBundle.asset,
        name: live.name || baseBundle.asset.name,
        price: live.price,
        change_percent: live.change_percent,
        volume: live.volume ?? baseBundle.asset.volume,
        trend,
        sparkline: live.sparkline ?? baseBundle.asset.sparkline,
      },
    };
  }, [baseBundle, mockOn, liveAssets, symStable]);

  const liveOff = !mockOn && (!bundle || bundle.asset.price <= 0 || bundle.asset.name === "Veri bekleniyor");

  const { toggleWatch, isWatched } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);
  const { inPortfolio, togglePortfolio, alerts, addPresetAlert, removeAlert } = useAssetDetailLocalMocks(symStable);
  const [alertsOpen, setAlertsOpen] = useState(false);

  /* Empty states */
  if (!decoded.trim()) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState title="Geçersiz sembol" description="URL'de bir sembol belirtin." actionLabel="Piyasalara dön" actionHref={MARKETS_HUB_PATH} tone="market" />
      </div>
    );
  }

  if (mockOn && !bundle) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState title="Sembol bulunamadı" description="Mock evrende bu sembol tanımlı değil." actionLabel="Piyasalara dön" onAction={() => router.push(MARKETS_HUB_PATH)} tone="market" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState title="Veri yüklenemedi" description="Varlık istihbaratı hazırlanamadı." actionLabel="Piyasalara dön" actionHref={MARKETS_HUB_PATH} tone="market" />
      </div>
    );
  }

  const sym         = bundle.asset.symbol;
  const accentColor = categoryAccentColor(bundle.asset.category ?? "");
  const accentGlow  = `${accentColor}18`;
  const accentBg    = `${accentColor}10`;

  return (
    <div
      className="ad-canvas ms-page-wrapper min-w-0"
      style={{
        /* Override accent per category */
        "--ad-accent":      accentColor,
        "--ad-accent-glow": accentGlow,
        "--ad-accent-bg":   accentBg,
      } as React.CSSProperties}
    >
      <div className="ms-container-markets min-w-0">

        {/* Breadcrumb */}
        <nav className="ad-breadcrumb">
          <button
            type="button"
            className="ad-breadcrumb-back"
            onClick={() => runViewTransition(() => router.push(MARKETS_HUB_PATH), { disabled: reduceMotion })}
          >
            ← Piyasalar
          </button>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
          <span style={{ fontWeight: 800, color: accentColor }}>{sym}</span>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <span style={{ color: "var(--ad-text-secondary)" }}>Varlık Detayı</span>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
          <Link href="/discover" style={{ color: accentColor, fontWeight: 700, textDecoration: "none" }}>
            Keşfet
          </Link>
        </nav>

        {/* ============================================
            ZONE 1 — HERO
            ============================================ */}
        <AssetDetailHero
          bundle={bundle}
          watched={isWatched(sym)}
          inPortfolio={inPortfolio}
          alertCount={alerts.length}
          onToggleWatch={() => toggleWatch(sym)}
          onTogglePortfolio={togglePortfolio}
          onOpenAlerts={() => setAlertsOpen(true)}
          liveOff={liveOff}
        />

        {/* ============================================
            ZONE 2 — DATA CORE
            ============================================ */}
        <div className="ad-main-grid">
          {/* Sol kolon */}
          <div className="ad-main-col">
            {/* Chart */}
            <AssetDetailChartWorkbench bundle={bundle} accentColor={accentColor} />

            {/* Signal Intelligence — kompakt */}
            <AssetDetailSignalIntelligence bundle={bundle} />

            {/* News + Calendar — birleşik */}
            <AssetDetailNewsCalendar bundle={bundle} />
          </div>

          {/* Sağ sidebar */}
          <AssetDetailSideRail
            bundle={bundle}
            watched={isWatched(sym)}
            inPortfolio={inPortfolio}
            creators={bundle.relatedCreators}
            alerts={alerts}
            onRemoveAlert={removeAlert}
            onOpenAlerts={() => setAlertsOpen(true)}
            symbol={sym}
            userHints={bundle.userContextHints}
          />
        </div>

        {/* Stats matrix — tam genişlik, sidebar'ın altında */}
        <div style={{ marginTop: 16 }}>
          <AssetDetailStatsMatrix rows={bundle.stats} />
        </div>

        {/* ============================================
            ZONE 3 — COMMUNITY HUB (Tabbed)
            ============================================ */}
        <AssetDetailCommunityTabs bundle={bundle} symbol={sym} />

      </div>

      {/* Alert Sheet */}
      <AssetDetailAlertSheet
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        symbol={sym}
        price={bundle.asset.price}
        alerts={alerts}
        onAdd={addPresetAlert}
        onRemove={removeAlert}
      />
    </div>
  );
}
