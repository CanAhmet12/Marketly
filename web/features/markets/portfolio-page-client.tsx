"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchPortfolioHoldings, type PortfolioHoldingLive } from "@/features/markets/fetch-portfolio-holdings";

import { EmptyState } from "@/components/states";
import { PortfolioPageSkeleton } from "@/features/markets/components/markets-states";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { getSignalsRepository } from "@/features/signals/repository";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import type { PersonalizedSignalRelevance } from "@/features/signals/repository/types";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

/* ================================
   MOCK ENRİCHMENT VERİSİ
   Gerçek P&L, toplam değer, grafik serisi
   ================================ */

const PORTFOLIO_STATS = {
  totalValue:   42_847.50,
  investedCost: 36_000.00,
  todayPnL:      +324.18,
  todayPnLPct:   +0.76,
  totalPnL:    +6_847.50,
  totalPnLPct:  +19.03,
  riskScore:       62,
  riskLabel:    "Orta",
  /* Aylık performans serisi (12 nokta) */
  perfSeries: [33800, 35200, 36100, 34900, 37200, 38800, 39400, 40100, 39600, 41200, 42100, 42847],
};

const HOLDING_ENRICHMENT: Record<string, { pnlPct: number; price: string; color: string }> = {
  BTC:   { pnlPct: +18.4,  price: "$103,840", color: "#f59e0b" },
  ETH:   { pnlPct: +12.8,  price: "$3,812",   color: "#a78bfa" },
  THYAO: { pnlPct: +28.4,  price: "291 TL",   color: "#06b6d4" },
  XU100: { pnlPct: +11.2,  price: "9,663",    color: "#3b82f6" },
  AAPL:  { pnlPct:  -3.2,  price: "$188",     color: "#22c55e" },
  SOL:   { pnlPct: +44.2,  price: "$198",     color: "#f97316" },
};

const CAT_COLORS: Record<string, string> = {
  crypto:    "#f59e0b",
  stocks:    "#06b6d4",
  index:     "#8b5cf6",
  forex:     "#8b5cf6",
  commodity: "#f97316",
};

/* ================================
   YARDIMCI FONKSİYONLAR
   ================================ */

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function changeClass(v: number): string {
  return v >= 0 ? "pf-pnl-val--up" : "pf-pnl-val--down";
}

function changeStatClass(v: number): string {
  return v >= 0 ? "pf-stat-change--up" : "pf-stat-change--down";
}

/* ================================
   PERFORMANS ALAN GRAFİĞİ (SVG)
   ================================ */

function PerformanceChart({ series }: { series: number[] }) {
  const id = useId().replace(/:/g, "");
  const W = 600; const H = 120; const padX = 8; const padY = 8;
  const min = Math.min(...series); const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => ({
    x: padX + (i / (series.length - 1)) * (W - padX * 2),
    y: padY + (1 - (v - min) / span) * (H - padY * 2),
  }));

  let line = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1]!.x + pts[i]!.x) / 2;
    line += ` C ${cpx.toFixed(1)} ${pts[i-1]!.y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i]!.y.toFixed(1)}, ${pts[i]!.x.toFixed(1)} ${pts[i]!.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1]!; const first = pts[0]!;
  const area = `${line} L ${last.x.toFixed(1)} ${H} L ${first.x.toFixed(1)} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pf-chart-svg" height={H} aria-label="Portföy performansı">
      <defs>
        <linearGradient id={`pfg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f9d75" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0f9d75" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#pfg-${id})`} stroke="none" />
      <path d={line} fill="none" stroke="#0f9d75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 0 8px rgba(15,157,117,0.5))" }} />
    </svg>
  );
}

/* ================================
   ALLOCATION DONUT (SVG)
   ================================ */

function AllocationDonut({ holdings }: { portfolio: PortfolioIntelligenceBundle; holdings: PortfolioIntelligenceBundle["holdings"] }) {
  const id = useId().replace(/:/g, "");
  const cx = 90; const cy = 90; const outerR = 78; const innerR = 52;
  const totalW = holdings.reduce((s, h) => s + h.weightPct, 0) || 100;

  function polar(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number): string {
    const os = polar(outerR, startDeg); const oe = polar(outerR, endDeg);
    const is = polar(innerR, endDeg);   const ie = polar(innerR, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
      `L ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  const arcs: { path: string; color: string; symbol: string; pct: number }[] = [];
  let start = 0;
  for (const h of holdings) {
    const sweep = (h.weightPct / totalW) * 360;
    const color = CAT_COLORS[h.category] ?? "#64748b";
    arcs.push({ path: arcPath(start, start + sweep - 0.5), color, symbol: h.symbol, pct: h.weightPct });
    start += sweep;
  }

  return (
    <div className="pf-donut-wrap">
      <svg className="pf-donut-svg" viewBox="0 0 180 180" width={180} height={180} aria-label="Portföy dağılımı">
        {arcs.map((arc, i) => (
          <path key={arc.symbol + i} d={arc.path} fill={arc.color} opacity={0.85}
            style={{ filter: `drop-shadow(0 0 4px ${arc.color}44)` }} />
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b" fontFamily="system-ui">
          TOPLAM
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="15" fontWeight="900" fill="#f1f5f9" fontFamily="system-ui" letterSpacing="-0.5">
          ${(PORTFOLIO_STATS.totalValue / 1000).toFixed(1)}K
        </text>
      </svg>

      {/* Legend */}
      <div className="pf-donut-legend">
        {holdings.map((h) => (
          <div key={h.symbol} className="pf-legend-row">
            <div className="pf-legend-dot" style={{ background: CAT_COLORS[h.category] ?? "#64748b" }} />
            <span className="pf-legend-label">{h.symbol}</span>
            <span className="pf-legend-pct">%{h.weightPct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================
   ANA CLIENT
   ================================ */

export function PortfolioPageClient() {
  const mockOn = isMockDataEnabled();
  const mRepo = useMemo(() => getMarketsRepository(), []);
  const sRepo = useMemo(() => getSignalsRepository(), []);
  const { watchlist, hydrated } = useMarketsWatchlist(mockOn ? mRepo.getWatchlistSeed() : undefined);

  const strip       = useMemo(() => mRepo.getPortfolioStrip(), [mRepo]);
  const portfolio   = useMemo(() => mRepo.getPortfolioIntelligenceBundle(), [mRepo]);
  const personalized = useMemo(
    () => sRepo.getPersonalizedSignalRelevance(Array.from(watchlist), portfolio.portfolioSymbols),
    [sRepo, watchlist, portfolio.portfolioSymbols],
  );

  const [activeTf, setActiveTf] = useState("1H");
  const TFS = ["1G", "1H", "3H", "YTD", "1Y"];

  // Canlı mod: Supabase'den holdings çek
  const { user } = useAuth();
  const [liveHoldings, setLiveHoldings] = useState<PortfolioHoldingLive[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  useEffect(() => {
    if (mockOn || !user?.id || !isSupabaseConfigured()) return;
    setLiveLoading(true);
    fetchPortfolioHoldings(getSupabaseBrowserClient(), user.id)
      .then(setLiveHoldings)
      .finally(() => setLiveLoading(false));
  }, [mockOn, user?.id]);

  if (!mockOn) {
    if (liveLoading) return <PortfolioPageSkeleton />;
    if (liveHoldings.length === 0) {
      return (
        <div className="pf-canvas ms-page-wrapper ms-container-markets min-w-0 py-16">
          <EmptyState title="Portföy boş" description="Henüz pozisyon eklenmemiş. APP üzerinden holding ekleyebilirsiniz." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" compact />
        </div>
      );
    }
    const totalValue = liveHoldings.reduce((s, h) => s + h.total_value, 0);
    const totalPnL   = liveHoldings.reduce((s, h) => s + h.pnl, 0);
    const totalCost  = liveHoldings.reduce((s, h) => s + h.avg_cost * h.quantity, 0);
    const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    return (
      <div className="pf-canvas ms-page-wrapper ms-container-markets min-w-0 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[var(--color-meta)] text-xs uppercase tracking-wider">Toplam Portföy</span>
          <span className="text-3xl font-bold">{fmtCurrency(totalValue)}</span>
          <span className={`text-sm font-semibold ${changeClass(totalPnL)}`}>
            {fmtCurrency(totalPnL)} ({fmtPct(totalPnLPct)})
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {liveHoldings.map((h) => (
            <div key={h.asset_id} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{h.asset_id}</span>
                <span className="text-xs text-[var(--color-meta)]">{h.quantity} adet · ort. {fmtCurrency(h.avg_cost)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-sm">{fmtCurrency(h.total_value)}</span>
                <span className={`text-xs font-semibold ${changeClass(h.pnl)}`}>{fmtPct(h.pnl_percent)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return <PortfolioPageSkeleton />;
  }

  if (portfolio.holdings.length === 0) {
    return (
      <div className="pf-canvas ms-page-wrapper ms-container-markets min-w-0 py-16">
        <EmptyState title="Portföy boş" description="Henüz pozisyon eklenmemiş." actionLabel="Piyasalar" actionHref={MARKETS_HUB_PATH} tone="market" />
      </div>
    );
  }

  const { risk, overlaps, holdings, strategyMix, headlineSentiment } = portfolio;
  const s = PORTFOLIO_STATS;

  return (
    <div className="pf-canvas ms-page-wrapper ms-container-markets min-w-0">

      {/* ===== HEADER ===== */}
      <div className="pf-header">
        <div className="pf-header-left">
          <span className="pf-header-tag">Marketly · Yatırım</span>
          <h1 className="pf-header-title">Kağıt Portföy</h1>
        </div>
        <div className="pf-header-actions">
          <Link href="/watchlist" className="pf-header-btn">⭐ İzleme Listesi</Link>
          <Link href="/signals" className="pf-header-btn">📊 Sinyaller</Link>
        </div>
      </div>

      {/* ===== HERO STATS STRIP ===== */}
      <div className="pf-hero">
        <div className="pf-stat">
          <span className="pf-stat-label">Toplam Değer</span>
          <span className="pf-stat-value pf-stat-value--accent">{fmtCurrency(s.totalValue)}</span>
          <span className="pf-stat-change pf-stat-change--neutral" style={{ fontSize: 11, color: "#475569" }}>
            Yatırılan: {fmtCurrency(s.investedCost)}
          </span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-label">Bugün P&L</span>
          <span className={cn("pf-stat-value", s.todayPnL >= 0 ? "pf-stat-change--up" : "pf-stat-change--down")}>
            {s.todayPnL >= 0 ? "+" : ""}{fmtCurrency(s.todayPnL)}
          </span>
          <span className={cn("pf-stat-change", changeStatClass(s.todayPnLPct))}>
            {fmtPct(s.todayPnLPct)}
          </span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-label">Toplam P&L</span>
          <span className={cn("pf-stat-value", s.totalPnL >= 0 ? "pf-stat-change--up" : "pf-stat-change--down")}>
            {s.totalPnL >= 0 ? "+" : ""}{fmtCurrency(s.totalPnL)}
          </span>
          <span className={cn("pf-stat-change", changeStatClass(s.totalPnLPct))}>
            {fmtPct(s.totalPnLPct)}
          </span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-label">Pozisyon</span>
          <span className="pf-stat-value">{holdings.length}</span>
          <span className="pf-stat-change pf-stat-change--neutral">{headlineSentiment.slice(0, 22)}</span>
        </div>
        <div className="pf-stat">
          <span className="pf-stat-label">Risk Skoru</span>
          <span className="pf-stat-value" style={{ color: s.riskScore > 70 ? "#ef4444" : s.riskScore > 45 ? "#f97316" : "#22c55e" }}>
            {s.riskScore}<span style={{ fontSize: 12, opacity: 0.6 }}>/100</span>
          </span>
          <span className="pf-stat-change pf-stat-change--neutral">{s.riskLabel}</span>
        </div>
      </div>

      {/* ===== MAIN 2-KOLON ===== */}
      <div className="pf-main">

        {/* SOL: Grafik + Tablo */}
        <div className="pf-left">

          {/* Performans grafiği */}
          <div className="pf-block">
            <div className="pf-block-header">
              <div className="pf-block-title">
                <span className="pf-block-stripe" />
                Portföy Performansı
              </div>
              <div className="pf-chart-tf">
                {TFS.map((tf) => (
                  <button key={tf} type="button"
                    className={cn("pf-tf-btn", activeTf === tf && "pf-tf-btn--active")}
                    onClick={() => setActiveTf(tf)}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="pf-chart-wrap">
              <PerformanceChart series={s.perfSeries} />
            </div>
          </div>

          {/* Holdings tablosu */}
          <div className="pf-block">
            <div className="pf-block-header">
              <div className="pf-block-title">
                <span className="pf-block-stripe" />
                Pozisyonlar
              </div>
            </div>
            <div className="pf-holdings" style={{ marginTop: 12 }}>
              <table className="pf-holdings-table">
                <thead>
                  <tr>
                    <th>Varlık</th>
                    <th>Kategori</th>
                    <th>Ağırlık</th>
                    <th className="right">Fiyat</th>
                    <th className="right">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const enrich = HOLDING_ENRICHMENT[h.symbol] ?? { pnlPct: 0, price: "—", color: "#64748b" };
                    return (
                      <tr key={h.symbol} onClick={() => { window.location.href = h.href; }}>
                        <td>
                          <Link href={h.href} style={{ textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                            <div className="pf-holding-name">{h.symbol}</div>
                            <div className="pf-holding-fullname">{h.name}</div>
                          </Link>
                        </td>
                        <td>
                          <span className={cn("pf-cat-badge", `pf-cat-badge--${h.category}`)}>
                            {h.category}
                          </span>
                        </td>
                        <td>
                          <div className="pf-weight-cell">
                            <div className="pf-weight-row">
                              <span className="pf-weight-pct">%{h.weightPct}</span>
                              <div className="pf-weight-bar">
                                <div className="pf-weight-fill" style={{ width: `${Math.min(100, h.weightPct * 1.5)}%`, background: enrich.color }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="pf-price-val">{enrich.price}</span>
                        </td>
                        <td>
                          <span className={cn("pf-pnl-val", changeClass(enrich.pnlPct))}>
                            {fmtPct(enrich.pnlPct)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* SAĞ: Sidebar */}
        <aside className="pf-sidebar">
          <div className="pf-sidebar-inner">

            {/* Allocation Donut */}
            <div className="pf-block">
              <div className="pf-block-header">
                <div className="pf-block-title">
                  <span className="pf-block-stripe" />
                  Dağılım
                </div>
              </div>
              <AllocationDonut portfolio={portfolio} holdings={holdings} />
            </div>

            {/* Strateji Mix */}
            <div className="pf-block">
              <div className="pf-block-header">
                <div className="pf-block-title">
                  <span className="pf-block-stripe" />
                  Strateji Karması
                </div>
              </div>
              <div className="pf-strategy-rows">
                {strategyMix.map((s, i) => {
                  const colors = ["#0f9d75", "#3b82f6", "#8b5cf6"];
                  return (
                    <div key={s.label} className="pf-strat-row">
                      <div className="pf-strat-header">
                        <span className="pf-strat-label">{s.label}</span>
                        <span className="pf-strat-pct">%{s.pct}</span>
                      </div>
                      <div className="pf-strat-bar">
                        <div className="pf-strat-fill" style={{ width: `${s.pct}%`, background: colors[i % colors.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Paneli */}
            <div className="pf-block">
              <div className="pf-block-header">
                <div className="pf-block-title">
                  <span className="pf-block-stripe" style={{ background: s.riskScore > 70 ? "#ef4444" : s.riskScore > 45 ? "#f97316" : "#22c55e" }} />
                  Risk Analizi
                </div>
              </div>
              <div className="pf-risk-body">
                <div className="pf-risk-gauge">
                  <div>
                    <div className="pf-risk-score" style={{ color: s.riskScore > 70 ? "#ef4444" : s.riskScore > 45 ? "#f97316" : "#22c55e" }}>
                      {s.riskScore}
                    </div>
                    <div className="pf-risk-label">{s.riskLabel} Risk</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[
                      { label: "Konsantrasyon", val: risk.concentrationLabel },
                      { label: "Volatilite", val: risk.volCluster },
                      { label: "Rejim", val: risk.regimeAlignment },
                    ].map((item) => (
                      <div key={item.label} className="pf-risk-item">
                        <span className="pf-risk-item-label">{item.label}</span>
                        <span className="pf-risk-item-value">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sektör dağılımı */}
                {risk.sectorTop.length > 0 && (
                  <div className="pf-sector-rows">
                    {risk.sectorTop.map((sec) => (
                      <div key={sec.label} className="pf-sector-row">
                        <span className="pf-sector-label">{sec.label}</span>
                        <div className="pf-sector-bar">
                          <div className="pf-sector-fill" style={{ width: `${sec.pct}%` }} />
                        </div>
                        <span className="pf-sector-pct">%{sec.pct}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>

      {/* ===== BOTTOM: Sinyal + Analist ===== */}
      <div className="pf-bottom-zone" style={{ marginTop: 20 }}>

        {/* Overlapping Analysts */}
        <div className="pf-block">
          <div className="pf-block-header">
            <div className="pf-block-title">
              <span className="pf-block-stripe" />
              Analist Örtüşmesi
            </div>
          </div>
          <div className="pf-analyst-rows">
            {overlaps.overlappingAnalysts.length === 0 ? (
              <p style={{ fontSize: 12, color: "#64748b", padding: "12px 18px" }}>Analist verisi bekleniyor.</p>
            ) : (
              overlaps.overlappingAnalysts.map((a) => (
                <Link key={a.href} href={a.href} className="pf-analyst-row">
                  <div className="pf-analyst-avatar">{a.display.slice(0, 1).toUpperCase()}</div>
                  <span className="pf-analyst-name">{a.display}</span>
                  <span className="pf-analyst-count">{a.count} sinyal</span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Personalized Signals */}
        <div className="pf-block">
          <div className="pf-block-header">
            <div className="pf-block-title">
              <span className="pf-block-stripe" />
              Portföy Sinyalleri
            </div>
            <Link href="/signals" className="pf-block-link">Tümü →</Link>
          </div>
          <div className="pf-signal-rows">
            {personalized.rows.length === 0 ? (
              <p style={{ fontSize: 12, color: "#64748b", padding: "12px 18px" }}>Sinyal örtüşmesi bulunamadı.</p>
            ) : (
              personalized.rows.slice(0, 5).map((row) => (
                <Link key={row.id} href={row.href} className="pf-signal-row">
                  <span className="pf-signal-sym">{row.symbol}</span>
                  <div className="pf-signal-info">
                    <div className="pf-signal-reason">{row.reason}</div>
                    <div className="pf-signal-meta">{row.analystDisplay} · {row.direction}</div>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: row.direction === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    color: row.direction === "BUY" ? "#22c55e" : "#ef4444",
                  }}>
                    {row.direction}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
