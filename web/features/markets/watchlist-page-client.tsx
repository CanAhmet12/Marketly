"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/states";
import { PrefetchOnHoverLink } from "@/components/ui/prefetch-on-hover-link";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { renderVirtualTableRows, useVirtualTableRows } from "@/features/markets/components/virtual-table-rows";
import { WatchlistPageSkeleton } from "@/features/markets/components/markets-states";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { useWatchlistIntelligence } from "@/features/markets/hooks/use-watchlist-intelligence";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import type { MarketAssetView } from "@/features/markets/types";
import { buildPersonalizedSignalRelevance } from "@/features/signals/lib/build-personalized-signal-relevance";
import { fetchSignalsFeed } from "@/features/signals/fetch-signals-feed";
import { getSignalsRepository } from "@/features/signals/repository";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MARKETS_WATCHLIST_ROW_HEIGHT } from "@/hooks/use-virtual-table-rows";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

/* ================================
   YARDIMCI
   ================================ */

function fmtPrice(n: number): string {
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1)     return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
}

function dirBadgeClass(dir: string): string {
  const u = dir.toUpperCase();
  if (u === "BUY")  return "wl-dir-badge--buy";
  if (u === "SELL") return "wl-dir-badge--sell";
  return "wl-dir-badge--hold";
}

type WatchlistRowProps = {
  sym: string;
  asset: MarketAssetView | undefined;
  pct: number;
  trend: "flat" | "up" | "down";
  signalCount: number;
  pinned: boolean;
  onRemove: (sym: string) => void;
};

const WatchlistTableRow = memo(function WatchlistTableRow({
  sym,
  asset,
  pct,
  trend,
  signalCount,
  pinned,
  onRemove,
}: WatchlistRowProps) {
  return (
    <tr>
      <td>
        <div className="wl-sym-cell">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PrefetchOnHoverLink href={`/markets/${encodeURIComponent(sym)}`} style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
              <span className="wl-sym-name">{sym}</span>
            </PrefetchOnHoverLink>
            {pinned ? <span className="wl-pin-badge">📌 sabit</span> : null}
          </div>
          {asset?.name ? <span className="wl-sym-fullname">{asset.name}</span> : null}
        </div>
      </td>
      <td>
        <span className="wl-price">{asset ? fmtPrice(asset.price) : "—"}</span>
      </td>
      <td>
        <span className={cn("wl-change-pct", pct >= 0 ? "wl-change-pct--up" : "wl-change-pct--down")}>
          {pct >= 0 ? "+" : ""}
          {pct.toFixed(2)}%
        </span>
      </td>
      <td style={{ textAlign: "right" }}>
        {signalCount > 0 ? (
          <PrefetchOnHoverLink href={`/signals?asset=${encodeURIComponent(sym)}`} className="wl-sig-badge" onClick={(e) => e.stopPropagation()}>
            {signalCount} sinyal
          </PrefetchOnHoverLink>
        ) : (
          <span style={{ fontSize: 11, color: "#475569" }}>—</span>
        )}
      </td>
      <td>
        {asset?.sparkline ? (
          <div className="wl-spark-cell">
            <MiniSparkline series={asset.sparkline} trend={trend} height={28} className="w-full" />
          </div>
        ) : null}
      </td>
      <td>
        <div className="wl-actions-cell">
          <PrefetchOnHoverLink href={`/signals?asset=${encodeURIComponent(sym)}`} className="wl-action-btn wl-action-btn--signals" onClick={(e) => e.stopPropagation()}>
            Sinyal
          </PrefetchOnHoverLink>
          <button
            type="button"
            className="wl-action-btn wl-action-btn--remove"
            aria-label={`${sym} sembolünü listeden çıkar`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(sym);
            }}
          >
            Çıkar
          </button>
        </div>
      </td>
    </tr>
  );
});

/* ================================
   ANA CLIENT
   ================================ */

export function WatchlistPageClient() {
  const mockOn = isMockDataEnabled();
  const mRepo  = useMemo(() => getMarketsRepository(), []);
  const sRepo  = useMemo(() => getSignalsRepository(), []);

  const { watchlist, pinned, hydrated, toggleWatch, isPinned } =
    useMarketsWatchlist(mockOn ? mRepo.getWatchlistSeed() : undefined);

  const { assets: liveAssets } = useMarketAssetsLive();
  const mockAssets = useMemo(() => mRepo.getDashboardPayload()?.assets ?? [], [mRepo]);
  const assets = useMemo(
    () => (!mockOn && liveAssets.length > 0 ? liveAssets : mockAssets),
    [mockOn, liveAssets, mockAssets],
  );
  const symbols   = [...watchlist].sort();

  const intel = useWatchlistIntelligence(Array.from(watchlist), Array.from(pinned));

  const liveSignalsQuery = useQuery({
    queryKey: queryKeys.signalsFeed(),
    queryFn: () => fetchSignalsFeed(getSupabaseBrowserClient()),
    enabled: !mockOn && isSupabaseConfigured(),
    staleTime: 60_000,
  });

  const personalized = useMemo(() => {
    if (mockOn) {
      const portfolioSyms = mRepo.getPortfolioIntelligenceBundle().portfolioSymbols;
      return sRepo.getPersonalizedSignalRelevance(Array.from(watchlist), portfolioSyms);
    }
    return buildPersonalizedSignalRelevance(liveSignalsQuery.data ?? [], Array.from(watchlist), [], null);
  }, [mockOn, mRepo, sRepo, watchlist, liveSignalsQuery.data]);

  const vt = useVirtualTableRows({
    count: symbols.length,
    rowHeight: MARKETS_WATCHLIST_ROW_HEIGHT,
  });

  /* Mover bar max değeri */
  const maxMoverAbs = Math.max(...intel.movers.map((m) => Math.abs(m.change_percent)), 1);

  /* İstatistikler */
  const highVolCount = intel.volatility.length;
  const activeSignals = intel.signalPulse.activeOnWatch;

  /* ======================= STATES ======================= */

  if (!hydrated) {
    return <WatchlistPageSkeleton />;
  }

  if (symbols.length === 0 && mockOn && intel.onboarding) {
    return (
      <div className="wl-page ms-page-wrapper ms-container-markets min-w-0">
        <div className="wl-header">
          <div className="wl-header-left">
            <span className="wl-header-tag">Marketly · Kişisel</span>
            <h1 className="wl-header-title">Takip Listesi</h1>
          </div>
          <div className="wl-header-actions">
            <Link href={MARKETS_HUB_PATH} className="wl-btn wl-btn--ghost">🔍 Sembol Keşfet</Link>
          </div>
        </div>

        <div className="wl-onboarding">
          <div>
            <h2 className="wl-onboarding-title">Takip Listenizi Oluşturun</h2>
            <p className="wl-onboarding-sub">{intel.onboarding.starterLabel}</p>
          </div>

          {/* Önerilen semboller */}
          <div className="wl-onboard-section">
            <p className="wl-onboard-label">Başlangıç Önerileri</p>
            <div className="wl-sym-chips">
              {intel.onboarding.suggestedSymbols.map((s) => (
                <Link key={s.symbol} href={s.href} className="wl-sym-chip">
                  <span className="wl-sym-chip-name">{s.symbol}</span>
                  <span className="wl-sym-chip-hint">{s.hint}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trend temalar */}
          <div className="wl-onboard-section">
            <p className="wl-onboard-label">Trend Temalar</p>
            <div className="wl-theme-chips">
              {intel.onboarding.trendingThemes.map((t) => (
                <span key={t} className="wl-theme-chip">{t}</span>
              ))}
            </div>
          </div>

          <div className="wl-onboarding-actions">
            <Link href={MARKETS_HUB_PATH} className="wl-btn wl-btn--primary">Piyasalara Git →</Link>
            <Link href="/discover" className="wl-btn wl-btn--ghost">Keşfet</Link>
            <Link href="/signals" className="wl-btn wl-btn--ghost">Sinyaller</Link>
          </div>
        </div>
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="wl-page ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState
          title="Takip listeniz boş"
          description="Piyasalar sayfasından sembol ekleyin. Giriş yaptıysanız liste cihazlarınız arasında senkronize edilir."
          actionLabel="Sembol Keşfet"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
        />
      </div>
    );
  }

  /* ======================= NORMAL SAYFA ======================= */

  const tableRows = renderVirtualTableRows({
    items: symbols,
    vt,
    getKey: (sym) => sym,
    renderRow: (sym) => {
      const asset = assets.find((a) => a.symbol.toUpperCase() === sym.toUpperCase());
      const mover = intel.movers.find((m) => m.symbol.toUpperCase() === sym.toUpperCase());
      const trend: "flat" | "up" | "down" = (asset?.change_percent ?? 0) > 0 ? "up" : (asset?.change_percent ?? 0) < 0 ? "down" : "flat";
      const pct = asset?.change_percent ?? mover?.change_percent ?? 0;
      return (
        <WatchlistTableRow
          sym={sym}
          asset={asset}
          pct={pct}
          trend={trend}
          signalCount={mover?.signalCount ?? 0}
          pinned={isPinned(sym)}
          onRemove={toggleWatch}
        />
      );
    },
  });

  return (
    <div className="wl-page ms-page-wrapper ms-container-markets min-w-0">

      {/* HEADER */}
      <div className="wl-header">
        <div className="wl-header-left">
          <span className="wl-header-tag">Marketly · Kişisel</span>
          <h1 className="wl-header-title">Takip Listesi</h1>
        </div>
        <div className="wl-header-actions">
          <Link href="/signals" className="wl-btn wl-btn--ghost">📊 Sinyaller</Link>
          <Link href={MARKETS_HUB_PATH} className="wl-btn wl-btn--primary">+ Sembol Ekle</Link>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="wl-stats">
        <div className="wl-stat">
          <span className="wl-stat-label">Takip Edilen</span>
          <span className="wl-stat-value wl-stat-value--accent">{symbols.length}</span>
          <span className="wl-stat-sub">Sembol</span>
        </div>
        <div className="wl-stat">
          <span className="wl-stat-label">Aktif Sinyal</span>
          <span className="wl-stat-value">{activeSignals}</span>
          <span className="wl-stat-sub">Açık çağrı</span>
        </div>
        <div className="wl-stat">
          <span className="wl-stat-label">Premium Çağrı</span>
          <span className="wl-stat-value">{intel.signalPulse.premiumOnWatch}</span>
          <span className="wl-stat-sub">Görünür</span>
        </div>
        <div className="wl-stat">
          <span className="wl-stat-label">Yüksek Volatilite</span>
          <span className="wl-stat-value" style={{ color: highVolCount > 2 ? "#f97316" : undefined }}>
            {highVolCount}
          </span>
          <span className="wl-stat-sub">Sembol</span>
        </div>
      </div>

      {/* MAIN 2-KOLON */}
      <div className="wl-main">

        {/* SOL: Quote tablo + Sinyaller */}
        <div className="wl-left">

          {/* Quote tablosu */}
          <div className="wl-block">
            <div className="wl-block-header">
              <div className="wl-block-title">
                <span className="wl-block-stripe" />
                Semboller
              </div>
            </div>
            <div ref={vt.scrollRef} className={cn("wl-table-wrap", vt.enabled && "mkt-vt-scroll")} style={vt.scrollStyle}>
              <table className="wl-table">
                <thead className={cn(vt.enabled && "mkt-vt-sticky-thead")}>
                  <tr>
                    <th>Sembol / Ad</th>
                    <th className="right">Fiyat</th>
                    <th className="right">Değişim</th>
                    <th className="right">Sinyal</th>
                    <th style={{ width: 90 }}>Grafik</th>
                    <th className="right">İşlem</th>
                  </tr>
                </thead>
                <tbody style={vt.tbodyStyle}>{tableRows}</tbody>
              </table>
            </div>
          </div>

          {/* Kişiselleştirilmiş sinyaller */}
          {personalized.rows.length > 0 && (
            <div className="wl-block">
              <div className="wl-block-header">
                <div className="wl-block-title">
                  <span className="wl-block-stripe" />
                  {personalized.headline}
                </div>
                <Link href="/signals" className="wl-block-link">Tüm sinyaller →</Link>
              </div>
              <div className="wl-signal-rows" style={{ marginTop: 8 }}>
                {personalized.rows.slice(0, 6).map((row) => (
                  <Link key={row.id} href={row.href} className="wl-signal-row">
                    <span className="wl-signal-sym">{row.symbol}</span>
                    <div className="wl-signal-info">
                      <div className="wl-signal-reason">{row.reason}</div>
                      <div className="wl-signal-meta">{row.analystDisplay} · %{row.confidence}</div>
                    </div>
                    <span className={cn("wl-dir-badge", dirBadgeClass(row.direction))}>
                      {row.direction}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* SAĞ: Sidebar */}
        <aside className="wl-sidebar">
          <div className="wl-sidebar-inner">

            {/* Sinyal nabzı */}
            <div className="wl-block">
              <div className="wl-block-header">
                <div className="wl-block-title">
                  <span className="wl-block-stripe" />
                  Sinyal Nabzı
                </div>
              </div>
              <div className="wl-pulse-body">
                <div className="wl-pulse-row">
                  <span className="wl-pulse-label">Aktif Çağrı</span>
                  <span className="wl-pulse-val">{intel.signalPulse.activeOnWatch}</span>
                </div>
                <div className="wl-pulse-row">
                  <span className="wl-pulse-label">Premium</span>
                  <span className="wl-pulse-val">{intel.signalPulse.premiumOnWatch}</span>
                </div>
                <div className="wl-pulse-row">
                  <span className="wl-pulse-label">24s Kopya</span>
                  <span className="wl-pulse-val">{intel.signalPulse.copies24h}</span>
                </div>
                <div style={{ paddingTop: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                  {intel.signalPulse.summaryLabel}
                </div>
              </div>
            </div>

            {/* Hareket */}
            {intel.movers.length > 0 && (
              <div className="wl-block">
                <div className="wl-block-header">
                  <div className="wl-block-title">
                    <span className="wl-block-stripe" />
                    Hareket
                  </div>
                </div>
                <div className="wl-mover-rows">
                  {intel.movers.slice(0, 5).map((m) => {
                    const isUp = m.change_percent >= 0;
                    const barWidth = Math.min(100, (Math.abs(m.change_percent) / maxMoverAbs) * 100);
                    return (
                      <Link key={m.symbol} href={m.href} className="wl-mover-row">
                        <span className="wl-mover-sym">{m.symbol}</span>
                        <div className="wl-mover-bar">
                          <div className={cn("wl-mover-fill", isUp ? "wl-mover-fill--up" : "wl-mover-fill--down")} style={{ width: `${barWidth}%` }} />
                        </div>
                        <span className="wl-mover-pct" style={{ color: isUp ? "var(--wl-up)" : "var(--wl-down)" }}>
                          {isUp ? "+" : ""}{m.change_percent.toFixed(2)}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tartışmalar */}
            {intel.discussionFeed.length > 0 && (
              <div className="wl-block">
                <div className="wl-block-header">
                  <div className="wl-block-title">
                    <span className="wl-block-stripe" />
                    Canlı Tartışma
                  </div>
                </div>
                <div className="wl-disc-rows">
                  {intel.discussionFeed.slice(0, 4).map((d) => (
                    <div key={d.id} className="wl-disc-row">
                      <p className="wl-disc-headline">
                        {d.live && <span className="wl-live-dot">CANLI</span>}
                        {d.headline}
                      </p>
                      <p className="wl-disc-meta">{d.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </aside>
      </div>

    </div>
  );
}
