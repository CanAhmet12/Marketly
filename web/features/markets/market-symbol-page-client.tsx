"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { AssetDetailAlertSheet } from "@/features/markets/components/asset-detail/asset-detail-alert-sheet";
import { AssetDetailChartWorkbench } from "@/features/markets/components/asset-detail/asset-detail-chart-workbench";
import { AssetDetailHero } from "@/features/markets/components/asset-detail/asset-detail-hero";
import { AssetDetailSignalIntelligence } from "@/features/markets/components/asset-detail/asset-detail-signal-intelligence";
import { AssetDetailNewsCalendar } from "@/features/markets/components/asset-detail/asset-detail-news-calendar";
import { AssetDetailStatsMatrix } from "@/features/markets/components/asset-detail/asset-detail-stats-matrix";
import { AssetDetailSideRail } from "@/features/markets/components/asset-detail/asset-detail-side-rail";
import { AssetDetailCommunityTabs } from "@/features/markets/components/asset-detail/asset-detail-community-tabs";
import { EmptyState } from "@/components/states";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { runViewTransition } from "@/lib/navigation/view-transition";
import { useAssetDetailLocalMocks } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import { useAssetIntelligence } from "@/features/markets/hooks/use-asset-intelligence";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { trackAssetView } from "@/features/personalization/tracking";
import { isMockDataEnabled } from "@/mock/config";

/** Varlık kategorisine göre accent rengi (generic ad-canvas) */
function categoryAccentColor(category: string): string {
  switch (category) {
    case "crypto":
      return "#f59e0b";
    case "stocks":
      return "#06b6d4";
    case "forex":
      return "#8b5cf6";
    case "commodity":
      return "#f97316";
    case "index":
      return "#3b82f6";
    default:
      return "#0f9d75";
  }
}

export function MarketSymbolPageClient() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const mockOn = isMockDataEnabled();
  const reduceMotion = usePrefersReducedMotion();
  const repo = useMemo(() => getMarketsRepository(), []);

  const raw = typeof params?.symbol === "string" ? params.symbol : "";
  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [raw]);

  const symStable = decoded.trim().toUpperCase() || "UNKNOWN";

  useEffect(() => {
    if (!decoded.trim()) return;
    trackAssetView(symStable, "markets_symbol");
  }, [symStable, decoded]);

  const { bundle, isLoading: intelLoading } = useAssetIntelligence(decoded);

  const liveOff = !mockOn && (!bundle || bundle.asset.price <= 0 || bundle.asset.name === "Veri bekleniyor");

  const { toggleWatch, isWatched } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);
  const { inPortfolio, togglePortfolio, alerts, addPresetAlert, removeAlert } = useAssetDetailLocalMocks(symStable);
  const [alertsOpen, setAlertsOpen] = useState(false);

  if (!decoded.trim()) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState
          title="Geçersiz sembol"
          description="URL'de bir sembol belirtin."
          actionLabel="Piyasalara dön"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
        />
      </div>
    );
  }

  if (mockOn && !bundle) {
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState
          title="Sembol bulunamadı"
          description="Mock evrende bu sembol tanımlı değil."
          actionLabel="Piyasalara dön"
          onAction={() => router.push(MARKETS_HUB_PATH)}
          tone="market"
        />
      </div>
    );
  }

  if (!bundle) {
    if (!mockOn && intelLoading) {
      return (
        <div className="ms-page-wrapper ms-container-markets min-w-0 py-16">
          <EmptyState
            title="Yükleniyor"
            description="Canlı kotasyon ve sinyal verisi hazırlanıyor."
            tone="market"
            compact
          />
        </div>
      );
    }
    return (
      <div className="ms-page-wrapper ms-container-markets">
        <EmptyState
          title="Veri yüklenemedi"
          description="Varlık istihbaratı hazırlanamadı."
          actionLabel="Piyasalara dön"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
        />
      </div>
    );
  }

  const sym = bundle.asset.symbol;
  const accentColor = categoryAccentColor(bundle.asset.category ?? "");
  const accentGlow = `${accentColor}18`;
  const accentBg = `${accentColor}10`;

  const heroProps = {
    bundle,
    watched: isWatched(sym),
    inPortfolio,
    alertCount: alerts.length,
    onToggleWatch: () => toggleWatch(sym),
    onTogglePortfolio: togglePortfolio,
    onOpenAlerts: () => setAlertsOpen(true),
    liveOff,
  };

  return (
    <div
      className="ad-canvas ms-page-wrapper min-w-0"
      style={
        {
          "--ad-accent": accentColor,
          "--ad-accent-glow": accentGlow,
          "--ad-accent-bg": accentBg,
        } as React.CSSProperties
      }
    >
      <div className="ms-container-markets min-w-0">
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

        <AssetDetailHero {...heroProps} />

        <div className="ad-main-grid">
          <div className="ad-main-col">
            <AssetDetailChartWorkbench bundle={bundle} accentColor={accentColor} />
            <AssetDetailSignalIntelligence bundle={bundle} />
            <AssetDetailNewsCalendar bundle={bundle} />
          </div>
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

        <div style={{ marginTop: 16 }}>
          <AssetDetailStatsMatrix rows={bundle.stats} />
        </div>

        <AssetDetailCommunityTabs bundle={bundle} symbol={sym} />
      </div>

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
