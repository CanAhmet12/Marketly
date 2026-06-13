"use client";

import Link from "next/link";

import type { CryptoAnchorAsset } from "@/features/markets/crypto/types";
import { CryptoInteractiveAreaChart } from "@/features/markets/crypto/components/crypto-interactive-area-chart";
import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import { cn } from "@/lib/cn";

type AnchorVariant = "btc" | "eth" | "sol";

type Props = {
  btc: CryptoAnchorAsset;
  eth: CryptoAnchorAsset;
  sol: CryptoAnchorAsset;
};

const VARIANT: Record<
  AnchorVariant,
  { panelClass: string; chartColor: string }
> = {
  btc: { panelClass: "cc-asset-panel--btc", chartColor: "#f59e0b" },
  eth: { panelClass: "cc-asset-panel--eth", chartColor: "#a78bfa" },
  sol: { panelClass: "cc-asset-panel--sol", chartColor: "#14f195" },
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function AssetPanel({ asset, variant }: { asset: CryptoAnchorAsset; variant: AnchorVariant }) {
  const { panelClass, chartColor } = VARIANT[variant];
  const isUp = asset.change24h >= 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(asset.symbol)}`}
      className={cn("cc-asset-panel block no-underline", panelClass)}
      aria-label={`${asset.name} detayına git`}
    >
      <div className="cc-asset-panel-header">
        <MarketSymbolIcon symbol={asset.symbol} size={34} className="cc-asset-panel-icon" />
        <span className="cc-asset-title">
          {asset.name.toUpperCase()}{" "}
          <span className="cc-asset-title-symbol">{asset.symbol}</span>
        </span>
      </div>

      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtPrice(asset.price)}</span>
        <span className={cn("cc-asset-change", isUp ? "cc-up" : "cc-down")}>
          {signed(asset.change24h)}
        </span>
      </div>

      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Piyasa Değeri</span>
          <span className="cc-asset-stat-value">{asset.marketCap}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">24s Hacim</span>
          <span className="cc-asset-stat-value">{asset.volume24h}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">7g Değişim</span>
          <span className={cn("cc-asset-stat-value", asset.change7d >= 0 ? "cc-up" : "cc-down")}>
            {signed(asset.change7d)}
          </span>
        </div>
      </div>

      <div className="cc-asset-chart-wrap">
        <CryptoInteractiveAreaChart series={asset.sparkline7d} color={chartColor} height={132} />
      </div>
    </Link>
  );
}

export function CryptoBtcEthPanels({ btc, eth, sol }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="Bitcoin, Ethereum ve Solana panelleri">
      <AssetPanel asset={btc} variant="btc" />
      <AssetPanel asset={eth} variant="eth" />
      <AssetPanel asset={sol} variant="sol" />
    </div>
  );
}
