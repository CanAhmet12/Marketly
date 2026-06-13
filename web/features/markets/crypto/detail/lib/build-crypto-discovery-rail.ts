import { formatCryptoDetailPrice } from "@/features/markets/crypto/detail/lib/crypto-detail-hero-utils";
import type { CryptoDiscoveryPayload, CryptoDiscoveryPeerRow } from "@/features/markets/crypto/detail/lib/crypto-discovery-types";
import {
  buildCryptoSegmentHeatmap,
  findCryptoSegmentPeers,
  resolveCryptoSegment,
} from "@/features/markets/crypto/lib/crypto-segment-utils";
import { sparkOrFlat, trendFromChange } from "@/features/markets/lib/live-category/live-category-shared";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function mapPeer(asset: MarketAssetView, correlationLabel: string): CryptoDiscoveryPeerRow {
  const change = asset.change_percent;
  return {
    symbol: asset.symbol,
    name: asset.name,
    href: `/markets/${encodeURIComponent(asset.symbol)}`,
    price: asset.price,
    change24h: change,
    marketCapLabel: asset.marketCapLabel,
    sparkline: sparkOrFlat(asset),
    trend: trendFromChange(change),
    correlationLabel,
  };
}

function buildCorrelatedFallback(bundle: AssetIntelligenceBundle, allAssets: readonly MarketAssetView[]): CryptoDiscoveryPeerRow[] {
  const seen = new Set<string>();
  const out: CryptoDiscoveryPeerRow[] = [];

  for (const peer of bundle.relatedNetwork.correlated) {
    const key = symKey(peer.symbol);
    if (seen.has(key)) continue;
    seen.add(key);
    const asset = allAssets.find((a) => symKey(a.symbol) === key);
    out.push(
      asset
        ? mapPeer(asset, peer.correlationLabel)
        : {
            symbol: peer.symbol,
            name: peer.symbol,
            href: peer.href,
            price: 0,
            change24h: 0,
            marketCapLabel: "—",
            sparkline: [],
            trend: "flat",
            correlationLabel: peer.correlationLabel,
          },
    );
    if (out.length >= 6) break;
  }

  if (out.length >= 4) return out;

  const extras = allAssets
    .filter((a) => symKey(a.symbol) !== symKey(bundle.asset.symbol) && !seen.has(symKey(a.symbol)))
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 6 - out.length)
    .map((a) => mapPeer(a, `${a.change_percent >= 0 ? "+" : ""}${a.change_percent.toFixed(2)}%`));

  return [...out, ...extras];
}

export function buildCryptoDiscoveryRail(
  bundle: AssetIntelligenceBundle,
  allAssets: readonly MarketAssetView[],
): CryptoDiscoveryPayload {
  const symbol = bundle.asset.symbol;
  const segment = resolveCryptoSegment(symbol);
  const segments = buildCryptoSegmentHeatmap(allAssets);
  const segmentStats = segments.find((s) => s.id === segment.id);

  const segmentPeers = findCryptoSegmentPeers(symbol, allAssets, 10);
  const peers = segmentPeers.map((a) =>
    mapPeer(a, `${a.change_percent >= 0 ? "+" : ""}${a.change_percent.toFixed(2)}%`),
  );

  const leaderFromStats = segmentStats?.leader ?? "—";
  const leaderMatch = leaderFromStats.match(/^([A-Z0-9]+)/);
  const leaderSymbol = leaderMatch?.[1] ?? segmentPeers[0]?.symbol ?? "BTC";
  const leaderAsset =
    allAssets.find((a) => symKey(a.symbol) === symKey(leaderSymbol)) ??
    segmentPeers.sort((a, b) => b.change_percent - a.change_percent)[0];
  const leaderChange = leaderAsset?.change_percent ?? segmentStats?.change24h ?? 0;

  const themeCluster = bundle.relatedNetwork.themeClusters[0] ?? null;
  const correlatedFallback = peers.length >= 4 ? peers : buildCorrelatedFallback(bundle, allAssets);

  const videos = bundle.media.slice(4, 12).map((m) => ({
    id: m.id,
    title: m.title,
    href: m.href,
    kind: m.kind,
    creatorDisplay: m.creatorDisplay,
    viewsLabel: m.viewsLabel,
    durationLabel: m.durationLabel,
    thumbnailUrl: m.thumbnailUrl,
  }));

  return {
    symbol,
    segmentId: segment.id,
    segmentLabel: segment.name,
    segmentChange24h: segmentStats?.change24h ?? 0,
    segmentLeaderSymbol: leaderAsset?.symbol ?? leaderSymbol,
    segmentLeaderChange: leaderChange,
    segmentLeaderHref: `/markets/${encodeURIComponent(leaderAsset?.symbol ?? leaderSymbol)}`,
    screenerHref: "/markets/category/crypto#screener",
    categoryHref: "/markets/category/crypto",
    discoverHref: "/discover",
    peers: peers.length > 0 ? peers : correlatedFallback.slice(0, 8),
    themeCluster,
    correlatedFallback,
    videos,
  };
}

export function formatDiscoveryPrice(price: number): string {
  if (price <= 0) return "—";
  return `$${formatCryptoDetailPrice(price)}`;
}
