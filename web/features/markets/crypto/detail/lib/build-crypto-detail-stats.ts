import { formatCompactUsd } from "@/features/markets/crypto/detail/lib/crypto-chart-utils";
import type { CryptoCoinMeta, CryptoDetailStatCell, CryptoDetailStatsPayload } from "@/features/markets/crypto/detail/lib/crypto-detail-stats-types";
import { resolveCryptoSegmentLabel } from "@/features/markets/crypto/lib/crypto-segment-utils";
import type { AssetSignalSummary } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

function formatSupply(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatUsdPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toLocaleString("en-US", { maximumSignificantDigits: 4 })}`;
}

function sparkRange(sparkline: readonly number[] | undefined, price: number): { high: number; low: number } {
  if (sparkline && sparkline.length > 1) {
    return { high: Math.max(...sparkline, price), low: Math.min(...sparkline, price) };
  }
  return { high: price * 1.018, low: price * 0.982 };
}

function volatilityLabel(changePct: number, sparkline?: readonly number[]): string {
  const span =
    sparkline && sparkline.length > 1
      ? ((Math.max(...sparkline) - Math.min(...sparkline)) / Math.max(...sparkline, 1)) * 100
      : Math.abs(changePct);
  if (span > 6 || Math.abs(changePct) > 5) return "Yüksek";
  if (span > 2.5 || Math.abs(changePct) > 2) return "Orta";
  return "Düşük";
}

function btcCorrelationLabel(assetChange: number, btcChange: number | null): string {
  if (btcChange == null) return "—";
  const delta = Math.abs(assetChange - btcChange);
  if (delta <= 0.35) return "BTC ile eşzamanlı";
  if (assetChange > 0 && btcChange < 0) return "BTC'ye karşı güçlü";
  if (assetChange < 0 && btcChange > 0) return "BTC'ye karşı zayıf";
  if (Math.abs(assetChange) > Math.abs(btcChange) * 1.35) return "Beta > BTC";
  if (Math.abs(assetChange) < Math.abs(btcChange) * 0.65) return "Beta < BTC";
  return "Orta korelasyon";
}

function supportResistance(price: number): { support: string; resistance: string } {
  const support = Math.round(price * 0.985 * 100) / 100;
  const resistance = Math.round(price * 1.015 * 100) / 100;
  return {
    support: formatUsdPrice(support),
    resistance: formatUsdPrice(resistance),
  };
}

function fallbackMeta(asset: MarketAssetView): CryptoCoinMeta {
  const spark = asset.sparkline ?? [];
  const ath = spark.length > 1 ? Math.max(...spark, asset.price) : asset.price * 1.18;
  const athChangePct = ath > 0 ? ((asset.price - ath) / ath) * 100 : 0;
  return {
    source: "fallback",
    ath,
    athChangePct,
    circulatingSupply: null,
    maxSupply: null,
    totalSupply: null,
    fdv: null,
    marketCapUsd: null,
    volume24hUsd: null,
  };
}

export function buildCryptoDetailStats(input: {
  asset: MarketAssetView;
  allAssets: readonly MarketAssetView[];
  meta: CryptoCoinMeta | null;
  signalSummary?: AssetSignalSummary;
}): CryptoDetailStatsPayload {
  const { asset, allAssets, signalSummary } = input;
  const meta = input.meta ?? fallbackMeta(asset);
  const change = asset.change_percent;
  const changeTone = change > 0 ? "up" : change < 0 ? "down" : "neutral";
  const range = sparkRange(asset.sparkline, asset.price);
  const { support, resistance } = supportResistance(asset.price);

  const btc = allAssets.find((a) => a.symbol.toUpperCase() === "BTC");
  const btcChange = btc?.change_percent ?? null;

  const athChange =
    meta.athChangePct ??
    (meta.ath && meta.ath > 0 ? ((asset.price - meta.ath) / meta.ath) * 100 : null);

  const mcap =
    asset.marketCapLabel && asset.marketCapLabel !== "—"
      ? asset.marketCapLabel
      : meta.marketCapUsd
        ? formatCompactUsd(meta.marketCapUsd)
        : "—";

  const volume =
    asset.volume && asset.volume !== "—"
      ? asset.volume
      : meta.volume24hUsd
        ? formatCompactUsd(meta.volume24hUsd)
        : "—";

  const cells: CryptoDetailStatCell[] = [
    { key: "mcap", label: "Piyasa Değeri", value: mcap, tone: "gold" },
    { key: "vol", label: "24s Hacim", value: volume },
    {
      key: "chg",
      label: "24s Değişim",
      value: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
      tone: changeTone,
    },
    {
      key: "ath-dist",
      label: "ATH Mesafe",
      value: athChange != null ? `${athChange >= 0 ? "+" : ""}${athChange.toFixed(1)}%` : "—",
      tone: athChange != null && athChange >= 0 ? "up" : "down",
      hint: meta.source === "coingecko" ? "CoinGecko ATH" : "Spark tahmini",
    },
    {
      key: "ath",
      label: "Tarihsel ATH",
      value: meta.ath ? formatUsdPrice(meta.ath) : "—",
    },
    {
      key: "supply-circ",
      label: "Dolaşımdaki Arz",
      value: formatSupply(meta.circulatingSupply),
    },
    {
      key: "supply-max",
      label: "Max Arz",
      value: meta.maxSupply ? formatSupply(meta.maxSupply) : meta.totalSupply ? formatSupply(meta.totalSupply) : "—",
      hint: meta.maxSupply ? undefined : "Sınırsız veya bilinmiyor",
    },
    {
      key: "fdv",
      label: "FDV",
      value: meta.fdv ? formatCompactUsd(meta.fdv) : "—",
      hint: "Fully diluted valuation",
    },
    {
      key: "btc-corr",
      label: "BTC Korelasyon",
      value: btcCorrelationLabel(change, btcChange),
      tone: "accent",
      hint: btcChange != null ? `BTC ${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(2)}%` : undefined,
    },
    {
      key: "segment",
      label: "Segment",
      value: resolveCryptoSegmentLabel(asset.symbol),
      tone: "gold",
    },
    {
      key: "range",
      label: "24s Koridor",
      value: `${formatUsdPrice(range.low)} – ${formatUsdPrice(range.high)}`,
      hint: "Spark / fiyat bandı",
    },
    {
      key: "volatility",
      label: "Volatilite",
      value: volatilityLabel(change, asset.sparkline),
      tone: Math.abs(change) > 4 ? "down" : "neutral",
    },
    {
      key: "support",
      label: "Destek",
      value: support,
    },
    {
      key: "resistance",
      label: "Direnç",
      value: resistance,
    },
    {
      key: "signals",
      label: "Aktif Sinyal",
      value: signalSummary ? String(signalSummary.activeTotal) : String(asset.signal_active_count),
      tone: (signalSummary?.activeTotal ?? asset.signal_active_count) > 0 ? "gold" : "muted",
      hint:
        signalSummary && signalSummary.activeTotal > 0
          ? `Bull payı %${signalSummary.bullSharePct}`
          : undefined,
    },
  ];

  return { cells, source: meta.source };
}
