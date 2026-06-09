"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { SignalConfBar } from "./discover-signal-tile";
import type { VRSignalItem } from "./discover-visual-reference-data";

type SignalMarketTone = "bist" | "crypto" | "forex" | "commodity" | "macro";

const MARKET_META: Record<SignalMarketTone, { label: string; cls: string }> = {
  bist: { label: "BIST", cls: "bist" },
  crypto: { label: "Kripto", cls: "crypto" },
  forex: { label: "Döviz", cls: "forex" },
  commodity: { label: "Emtia", cls: "commodity" },
  macro: { label: "Makro", cls: "macro" },
};

function signalDirMeta(direction: VRSignalItem["direction"]) {
  if (direction === "BUY") return { label: "Al", short: "AL", cls: "buy" as const };
  if (direction === "SELL") return { label: "Sat", short: "SAT", cls: "sell" as const };
  return { label: "Bekle", short: "BEKLE", cls: "hold" as const };
}

function getSignalMarketTone(symbol: string): SignalMarketTone {
  const s = symbol.toUpperCase();
  if (/BTC|ETH|SOL|BNB|XRP|DOGE|CRYPTO/.test(s)) return "crypto";
  if (/XAU|XAG|ALTIN|GOLD|SILVER/.test(s)) return "commodity";
  if (/USD\/TRY|EUR\/|GBP\/|JPY|\/USD|\/TRY|DXY/.test(s)) return "forex";
  if (/THYAO|GARAN|ASELS|SISE|BIMAS|BIST|\.IS/.test(s) || (!s.includes("/") && !s.startsWith("$") && s.length <= 6)) {
    return "bist";
  }
  return "macro";
}

function DirGlyph({ direction }: { direction: VRSignalItem["direction"] }) {
  if (direction === "BUY") {
    return (
      <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
        <path d="M5 1 L9 9 L1 9 Z" />
      </svg>
    );
  }
  if (direction === "SELL") {
    return (
      <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
        <path d="M5 9 L9 1 L1 1 Z" />
      </svg>
    );
  }
  return <span aria-hidden>—</span>;
}

function SignalPriceTape({ position }: { position: number }) {
  const pct = Math.min(100, Math.max(4, position));
  return (
    <div className="dvr-sig-rail-card__tape">
      <div className="dvr-sig-rail-card__tape-head">
        <span className="dvr-sig-rail-card__tape-title">Fiyat konumu</span>
        <span className="dvr-sig-rail-card__tape-pct tabular-nums">%{pct}</span>
      </div>
      <div className="dvr-sig-rail-card__tape-track" aria-hidden>
        <span className="dvr-sig-rail-card__tape-pin dvr-sig-rail-card__tape-pin--stop" style={{ left: "8%" }} />
        <span className="dvr-sig-rail-card__tape-pin dvr-sig-rail-card__tape-pin--entry" style={{ left: "38%" }} />
        <span className="dvr-sig-rail-card__tape-pin dvr-sig-rail-card__tape-pin--target" style={{ left: "88%" }} />
        <span className="dvr-sig-rail-card__tape-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="dvr-sig-rail-card__tape-labels" aria-hidden>
        <span>Stop</span>
        <span>Giriş</span>
        <span>Hedef</span>
      </div>
    </div>
  );
}

function DiscoverSignalRailCardInner({
  item,
  index = 0,
}: {
  item: VRSignalItem;
  index?: number;
}) {
  const dir = signalDirMeta(item.direction);
  const market = MARKET_META[getSignalMarketTone(item.symbol)];

  return (
    <article
      className={cn(
        "dvr-sig-rail-card group relative z-0 motion-entrance",
        `dvr-sig-rail-card--${dir.cls}`,
        `dvr-sig-rail-card--status-${item.signalStatus}`,
      )}
      style={motionEntranceDelay(index)}
    >
      <Link
        href={item.href}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`${item.symbol} sinyali`}
      />

      <div className="dvr-sig-rail-card__glow" aria-hidden />
      <div className="dvr-sig-rail-card__accent" aria-hidden />

      <div className="relative z-1 flex h-full min-h-0 flex-col gap-3 p-4 sm:gap-3.5 sm:p-[1.15rem]">
        <div className="dvr-sig-rail-card__head">
          <div className="min-w-0 flex-1">
            <div className="dvr-sig-rail-card__symbol-row">
              <p className="dvr-sig-rail-card__symbol tabular-nums">{item.symbol}</p>
              <span className={cn("dvr-sig-rail-card__market", `dvr-sig-rail-card__market--${market.cls}`)}>
                {market.label}
              </span>
            </div>
            <p className="dvr-sig-rail-card__asset truncate">{item.assetName}</p>
          </div>
          <div className="dvr-sig-rail-card__badges shrink-0">
            <span className={cn("dvr-sig-rail-card__dir", `dvr-sig-rail-card__dir--${dir.cls}`)}>
              <DirGlyph direction={item.direction} />
              {dir.short}
            </span>
            <span className="dvr-sig-rail-card__tf tabular-nums">{item.timeframe}</span>
          </div>
        </div>

        <div className="dvr-sig-rail-card__live">
          <div className="dvr-sig-rail-card__live-main">
            <span className="dvr-sig-rail-card__live-dot" aria-hidden />
            <span className="dvr-sig-rail-card__live-label">Anlık</span>
            <span className="dvr-sig-rail-card__spot tabular-nums">{item.spotPrice}</span>
            <span
              className={cn(
                "dvr-sig-rail-card__change tabular-nums",
                item.changePositive ? "dvr-sig-rail-card__change--up" : "dvr-sig-rail-card__change--down",
              )}
            >
              {item.changePct}
            </span>
          </div>
          <span className={cn("dvr-sig-rail-card__status", `dvr-sig-rail-card__status--${item.signalStatus}`)}>
            {item.signalStatusLabel}
          </span>
        </div>

        <div className="dvr-sig-rail-card__levels">
          <div className="dvr-sig-rail-card__level">
            <span className="dvr-sig-rail-card__level-label">Giriş</span>
            <span className="dvr-sig-rail-card__level-value tabular-nums">{item.entry}</span>
          </div>
          <div className="dvr-sig-rail-card__level dvr-sig-rail-card__level--target">
            <span className="dvr-sig-rail-card__level-label">Hedef</span>
            <span className="dvr-sig-rail-card__level-value tabular-nums">{item.target}</span>
          </div>
          <div className="dvr-sig-rail-card__level dvr-sig-rail-card__level--stop">
            <span className="dvr-sig-rail-card__level-label">Stop</span>
            <span className="dvr-sig-rail-card__level-value tabular-nums">{item.stop}</span>
          </div>
        </div>

        <SignalPriceTape position={item.pricePosition} />

        <p className="dvr-sig-rail-card__rationale line-clamp-2">{item.rationale}</p>

        <div className="dvr-sig-rail-card__intel">
          <div className="dvr-sig-rail-card__conf">
            <span className="dvr-sig-rail-card__conf-label">Güven</span>
            <SignalConfBar value={item.confidence} size="md" />
          </div>
          <div className="dvr-sig-rail-card__rr-wrap">
            <span className="dvr-sig-rail-card__rr-label">R/R</span>
            <span className="dvr-sig-rail-card__rr tabular-nums">{item.rr}</span>
          </div>
        </div>

        <div className="dvr-sig-rail-card__foot">
          <div className="dvr-sig-rail-card__analyst min-w-0">
            <span
              className="dvr-sig-rail-card__avatar"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${item.analystColor}ee, ${item.analystColor}88)`,
              }}
              aria-hidden
            >
              {item.analyst[0]}
            </span>
            <div className="min-w-0">
              <p className="dvr-sig-rail-card__analyst-name truncate">{item.analyst}</p>
              <p className="dvr-sig-rail-card__analyst-handle truncate">{item.analystHandle}</p>
            </div>
          </div>
          <span className="dvr-sig-rail-card__age tabular-nums">{item.age}</span>
        </div>
      </div>
    </article>
  );
}

export const DiscoverSignalRailCard = memo(DiscoverSignalRailCardInner);
