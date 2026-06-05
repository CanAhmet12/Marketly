"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  VR_MARKET_TICKERS,
  VR_MINI_SIGNALS,
  type VRMarketTicker,
  type VRMiniSignal,
} from "./discover-visual-reference-data";

/* ─── Top atmosphere ticker ──────────────────────────────────────────────── */
export function MarketTickerStrip({ tickers = VR_MARKET_TICKERS }: { tickers?: VRMarketTicker[] }) {
  const row = tickers.length > 0 ? tickers : VR_MARKET_TICKERS;
  return (
    <div className="dvr-ticker-strip" aria-label="Piyasa nabzı" role="marquee">
      <div className="dvr-ticker-inner">
        {/* Render twice for seamless loop feel */}
        {[...row, ...row].map((t, i) => (
          <Link key={`${t.id}-${i}`} href={t.href} className="dvr-ticker-item shrink-0">
            <span className="dvr-ticker-symbol">{t.symbol}</span>
            <span className="dvr-ticker-price">{t.price}</span>
            <span
              className={cn(
                "dvr-ticker-change tabular-nums",
                t.positive ? "dvr-ticker-change--up" : "dvr-ticker-change--down",
              )}
            >
              {t.change}
            </span>
          </Link>
        ))}
      </div>
    </div>
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
        className={cn("dvr-mini-sig-bar h-3.5 w-[2px] shrink-0 rounded-full",
          item.direction === "BUY"  && "bg-emerald-400/80",
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
  { id: "at-1", label: "Bitcoin", sub: "+2,4%", positive: true, href: "/markets/BTC" },
  { id: "at-2", label: "TCMB", sub: "Karar haftası", positive: null, href: "/markets/USDTRY" },
  { id: "at-3", label: "BIST bankaları", sub: "Hacim yukarı", positive: true, href: "/markets/XU100" },
  { id: "at-4", label: "Fed takvimi", sub: "Yarın", positive: null, href: "/markets/SPX" },
  { id: "at-5", label: "Kripto rotasyonu", sub: "ETH önde", positive: true, href: "/markets/ETH" },
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
                t.positive === true  && "text-emerald-400/80",
                t.positive === false && "text-red-400/80",
                t.positive === null  && "dvr-atm-sub--neutral",
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

/* ─── Üst bar: yalnızca ticker (sekmeler + gündem şeridi ayrı katman) ──────── */
/** Ticker verisi üst katmanda bilinçli static/adapter fallback; gerçek piyasa stream’i ayrı entegrasyon. */
export function MarketAtmosphereStack({ tickers }: { tickers?: VRMarketTicker[] }) {
  return <MarketTickerStrip tickers={tickers} />;
}
