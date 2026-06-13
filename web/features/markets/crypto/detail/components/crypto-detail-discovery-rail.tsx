"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import {
  buildCryptoDiscoveryRail,
  formatDiscoveryPrice,
} from "@/features/markets/crypto/detail/lib/build-crypto-discovery-rail";
import { SegmentBadge } from "@/features/markets/crypto/components/crypto-editorial-icons";
import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  allAssets: readonly MarketAssetView[];
};

function changeClass(v: number): string {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "";
}

function mediaKindLabel(kind: string): string {
  if (kind === "live") return "CANLI";
  if (kind === "short") return "SHORT";
  return "VİDEO";
}

export function CryptoDetailDiscoveryRail({ bundle, allAssets }: Props) {
  const rail = useMemo(() => buildCryptoDiscoveryRail(bundle, allAssets), [bundle, allAssets]);

  return (
    <section className="cd-discovery-rail cd-discovery-v3" role="region" aria-label="Keşif">

      <div className="cd-discovery-segment-banner">
        <div className="cd-discovery-segment-main">
          <SegmentBadge id={rail.segmentId} />
          <span className="cd-discovery-segment-name">{rail.segmentLabel}</span>
          <span className={cn("cd-discovery-segment-change", changeClass(rail.segmentChange24h))}>
            {formatSignedChangePercent(rail.segmentChange24h)} 24s
          </span>
        </div>
        <Link href={rail.segmentLeaderHref} className="cd-discovery-segment-leader">
          Segment lideri: <strong>{rail.segmentLeaderSymbol}</strong>{" "}
          <span className={changeClass(rail.segmentLeaderChange)}>
            {formatSignedChangePercent(rail.segmentLeaderChange)}
          </span>
        </Link>
      </div>

      {rail.themeCluster ? (
        <>
          <div className="cd-discovery-zone-rule" aria-hidden />
          <div className="cd-discovery-theme-row">
            <span className="cd-discovery-theme-label">{rail.themeCluster.label}</span>
            <div className="cd-discovery-theme-symbols">
              {rail.themeCluster.symbols.map((s) => (
                <Link key={s} href={`/markets/${encodeURIComponent(s)}`} className="cd-discovery-theme-chip">
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {rail.peers.length > 0 ? (
        <>
          <div className="cd-discovery-zone-rule" aria-hidden />
          <div className="cd-discovery-peer-block">
            <p className="cd-discovery-block-title">Benzer coinler & korelasyon</p>
            <div className="cd-discovery-peer-scroll">
              {rail.peers.map((peer) => (
                <Link key={peer.symbol} href={peer.href} className="cd-discovery-peer-card">
                  <div className="cd-discovery-peer-top">
                    <MarketSymbolIcon symbol={peer.symbol} size={28} />
                    <div className="cd-discovery-peer-meta">
                      <span className="cd-discovery-peer-symbol">{peer.symbol}</span>
                      <span className="cd-discovery-peer-name">{peer.name}</span>
                    </div>
                  </div>
                  <div className="cd-discovery-peer-price-row">
                    <span className="cd-discovery-peer-price">{formatDiscoveryPrice(peer.price)}</span>
                    <span className={cn("cd-discovery-peer-change", changeClass(peer.change24h))}>
                      {formatSignedChangePercent(peer.change24h)}
                    </span>
                  </div>
                  <div className="cd-discovery-peer-spark">
                    {peer.sparkline.length > 1 ? (
                      <MiniSparkline series={peer.sparkline} trend={peer.trend} height={28} className="w-full" />
                    ) : null}
                  </div>
                  <span className="cd-discovery-peer-corr">{peer.correlationLabel}</span>
                  <span className="cd-discovery-peer-mcap">{peer.marketCapLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {rail.videos.length > 0 ? (
        <>
          <div className="cd-discovery-zone-rule" aria-hidden />
          <div className="cd-discovery-video-block">
            <div className="cd-discovery-video-head">
              <p className="cd-discovery-block-title">Creator videoları</p>
              <Link href={rail.discoverHref} className="cd-zone-link">
                Keşfet →
              </Link>
            </div>
            <div className="cd-discovery-video-scroll">
              {rail.videos.map((v) => (
                <Link key={v.id} href={v.href} className="cd-discovery-video-card">
                  <div className="cd-discovery-video-thumb">
                    {v.thumbnailUrl ? (
                      <Image src={v.thumbnailUrl} alt="" fill className="object-cover" sizes="220px" unoptimized />
                    ) : (
                      <span className="cd-discovery-video-fallback">{mediaKindLabel(v.kind)}</span>
                    )}
                    <span className="cd-discovery-video-kind">{mediaKindLabel(v.kind)}</span>
                    {v.durationLabel ? (
                      <span className="cd-discovery-video-duration">{v.durationLabel}</span>
                    ) : null}
                  </div>
                  <p className="cd-discovery-video-title">{v.title}</p>
                  <p className="cd-discovery-video-creator">{v.creatorDisplay}</p>
                  <p className="cd-discovery-video-views">{v.viewsLabel}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="cd-discovery-zone-rule" aria-hidden />

      <div className="cd-discovery-foot">
        <Link href={rail.screenerHref} className="cd-discovery-foot-btn">
          Segment tarayıcısına dön
        </Link>
        <Link href={rail.categoryHref} className="cd-discovery-foot-btn cd-discovery-foot-btn--ghost">
          Kripto piyasaları
        </Link>
        <Link href={`/signals?asset=${encodeURIComponent(rail.symbol)}`} className="cd-discovery-foot-btn cd-discovery-foot-btn--ghost">
          {rail.symbol} sinyalleri
        </Link>
      </div>
    </section>
  );
}
