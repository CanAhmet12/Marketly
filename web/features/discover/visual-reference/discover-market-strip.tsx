"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";

import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { MARKETS_HUB_PATH, marketSymbolPath } from "@/features/markets/markets-routes";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

import { resolveTickerMark, TickerMark } from "./discover-ticker-mark";
import {
  VR_MARKET_TICKERS,
  VR_MINI_SIGNALS,
  type VRMarketTicker,
  type VRMiniSignal,
} from "./discover-visual-reference-data";

function formatTickerPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
  return price.toLocaleString("tr-TR", { maximumFractionDigits: 6 });
}

export function mapAssetsToTickers(assets: MarketAssetView[]): VRMarketTicker[] {
  return [...assets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 14)
    .map((a) => ({
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price: formatTickerPrice(a.price),
      change: formatSignedChangePercent(a.change_percent),
      positive: a.change_percent > 0,
      href: marketSymbolPath(a.symbol),
      category: a.category,
    }));
}

function TickerRow({
  items,
  ariaHidden = false,
  keyPrefix = "",
}: {
  items: VRMarketTicker[];
  ariaHidden?: boolean;
  keyPrefix?: string;
}) {
  return (
    <div className="dvr-ticker-inner" aria-hidden={ariaHidden || undefined}>
      {items.map((t, i) => {
        const mark = resolveTickerMark(t.symbol, t.category);
        return (
          <Link
            key={`${keyPrefix}${t.id}`}
            href={t.href}
            className="dvr-ticker-item"
            title={t.name}
            data-category={mark.category ?? undefined}
            style={
              {
                "--ticker-accent": mark.color,
                "--ticker-stagger": `${(i % 8) * 0.35}s`,
              } as CSSProperties
            }
            tabIndex={ariaHidden ? -1 : undefined}
          >
            <TickerMark symbol={t.symbol} category={t.category} />
            <span className="dvr-ticker-symbol">{t.symbol}</span>
            <span className="dvr-ticker-price">{t.price}</span>
            <span
              className={cn(
                "dvr-ticker-change",
                t.positive ? "dvr-ticker-change--up" : "dvr-ticker-change--down",
              )}
            >
              {t.change}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Premium piyasa ticker ──────────────────────────────────────────────── */
export function MarketTickerStrip({ tickers }: { tickers: VRMarketTicker[] }) {
  const row = tickers;
  const marquee = row.length >= 3;

  return (
    <nav className="dvr-ticker-strip" aria-label="Piyasa ticker" data-marquee={marquee || undefined}>
      <div className="dvr-ticker-shell">
        <div className={cn("dvr-ticker-scroll-wrap", marquee && "dvr-ticker-scroll-wrap--marquee")}>
          {row.length > 0 ? (
            <div
              className={cn("dvr-ticker-track", marquee && "dvr-ticker-track--live")}
              style={
                marquee
                  ? ({ "--ticker-marquee-dur": `${Math.max(28, row.length * 4.2)}s` } as CSSProperties)
                  : undefined
              }
            >
              <TickerRow items={row} keyPrefix="a-" />
              {marquee ? <TickerRow items={row} ariaHidden keyPrefix="b-" /> : null}
            </div>
          ) : (
            <div className="dvr-ticker-inner">
              <span className="dvr-ticker-empty">Piyasa verisi yükleniyor…</span>
            </div>
          )}
        </div>

        <Link href="/markets" className="dvr-ticker-all" aria-label="Tüm piyasalar">
          <span className="dvr-ticker-all__arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </nav>
  );
}

/* ─── Mini signal pill for stream interruption ───────────────────────────── */
function MiniSignalPill({ item }: { item: VRMiniSignal }) {
  const arrowCls =
    item.direction === "BUY"
      ? "text-emerald-400"
      : item.direction === "SELL"
        ? "text-red-400"
        : "text-amber-400";

  return (
    <Link
      href={item.href}
      className="dvr-mini-signal-pill group inline-flex shrink-0 items-center gap-1.5 rounded-lg"
    >
      <span
        className={cn(
          "dvr-mini-sig-bar h-3.5 w-[2px] shrink-0 rounded-full",
          item.direction === "BUY" && "bg-emerald-400/80",
          item.direction === "SELL" && "bg-red-400/80",
          item.direction === "HOLD" && "bg-amber-400/60",
        )}
        aria-hidden
      />
      <span className="dvr-mini-signal-symbol tabular-nums">{item.symbol}</span>
      <span className={cn("dvr-mini-signal-dir font-bold", arrowCls)}>
        {item.direction === "BUY" ? "▲" : item.direction === "SELL" ? "▼" : "—"}
      </span>
      <span
        className={cn(
          "dvr-mini-signal-change tabular-nums",
          item.positive ? "text-emerald-400/75" : "text-red-400/75",
        )}
      >
        {item.change}
      </span>
      <span className="dvr-mini-signal-age">{item.age}</span>
    </Link>
  );
}

export function MiniSignalStrip({ label = "Aktif Sinyaller", compact = false }: { label?: string; compact?: boolean }) {
  const pills = compact ? VR_MINI_SIGNALS.slice(0, 5) : VR_MINI_SIGNALS;
  return (
    <div className={cn("dvr-mini-signal-strip", compact && "dvr-mini-signal-strip--compact")} aria-label={label}>
      <div className="dvr-mini-signal-header">
        <span className="dvr-mini-signal-label">{label}</span>
        <Link href="/signals" className="dvr-mini-signal-link">
          Tümünü gör →
        </Link>
      </div>
      <div className="dvr-mini-signal-row">
        {pills.map((s) => (
          <MiniSignalPill key={s.id} item={s} />
        ))}
      </div>
    </div>
  );
}

/* ─── Atmosphere discovery strip (top of content) ────────────────────────── */
const ATMOSPHERE_TOPICS = [
  { id: "at-1", label: "Bitcoin", sub: "+2,4%", positive: true, href: MARKETS_HUB_PATH },
  { id: "at-2", label: "TCMB", sub: "Karar haftası", positive: null, href: "/markets/USDTRY" },
  { id: "at-3", label: "BIST bankaları", sub: "Hacim yukarı", positive: true, href: "/markets/XU100" },
  { id: "at-4", label: "Fed takvimi", sub: "Yarın", positive: null, href: "/markets/SPX" },
  { id: "at-5", label: "Kripto rotasyonu", sub: "ETH önde", positive: true, href: MARKETS_HUB_PATH },
  { id: "at-6", label: "Altın", sub: "Dolar baskısı", positive: false, href: "/markets/XAUUSD" },
  { id: "at-7", label: "Teknoloji", sub: "Güçlü", positive: true, href: "/markets/SPX" },
  { id: "at-8", label: "VIOP", sub: "Açık artıyor", positive: null, href: "/signals" },
] as const;

export function DiscoverAtmosphereStrip() {
  const chips = ATMOSPHERE_TOPICS.slice(0, 5);
  return (
    <div className="dvr-atm-strip" aria-label="Gündemin içinden">
      <div className="dvr-atm-inner">
        {chips.map((t) => (
          <Link key={t.id} href={t.href} className="dvr-atm-chip group shrink-0">
            <span className="dvr-atm-label">{t.label}</span>
            <span
              className={cn(
                "dvr-atm-sub",
                t.positive === true && "text-emerald-400/80",
                t.positive === false && "text-red-400/80",
                t.positive === null && "dvr-atm-sub--neutral",
              )}
            >
              {t.sub}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Üst bar: canlı ticker ─────────────────────────────────────────────── */
export function MarketAtmosphereStack({ tickers: propTickers }: { tickers?: VRMarketTicker[] }) {
  const { assets } = useMarketAssetsLive();

  const liveTickers = useMemo(() => mapAssetsToTickers(assets), [assets]);

  const effective = useMemo(() => {
    if (propTickers && propTickers.length > 0) return propTickers;
    if (liveTickers.length > 0) return liveTickers;
    if (isMockDataEnabled()) return VR_MARKET_TICKERS;
    return [];
  }, [propTickers, liveTickers]);

  return <MarketTickerStrip tickers={effective} />;
}
