"use client";

import Link from "next/link";
import { useState, memo } from "react";

import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import {
  assetNewsCategoryLabel,
  assetNewsPhotoUrl,
  assetNewsSentimentLabel,
  assetNewsToVideoTone,
  assetNewsImpactLabel,
} from "@/features/markets/crypto/symbol-detail/lib/map-asset-news";
import { minutesAgoLabel } from "@/features/markets/crypto/symbol-detail/lib/format";
import type { AssetMarketNewsItem } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";
import { motionEntranceDelay } from "@/lib/motion-stagger";

type Props = {
  item: AssetMarketNewsItem;
  index?: number;
  editorialLead?: boolean;
};

function NewsThumb({ item, eager }: { item: AssetMarketNewsItem; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = assetNewsPhotoUrl(item);
  const remote = url.startsWith("http://") || url.startsWith("https://");
  const tone = assetNewsToVideoTone(item.category);

  return (
    <div className="dvr-video-thumb-well absolute inset-0 overflow-hidden">
      {url && !failed ? (
        remote ? (
          <RemoteCoverImage
            src={url}
            alt=""
            className="dvr-video-thumb-photo absolute inset-0 z-0"
            sizes="(max-width: 640px) 88vw, 560px"
            priority={eager}
            onFailed={() => setFailed(true)}
          />
        ) : (
          <img
            src={url}
            alt=""
            className="dvr-video-thumb-photo absolute inset-0 z-0 h-full w-full object-cover"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div
          className="dvr-video-thumb-chart pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              tone === "crypto"
                ? "linear-gradient(145deg, #2a1f4a 0%, #0d0f17 100%)"
                : "linear-gradient(145deg, #0c1424 0%, #0d0f17 100%)",
          }}
        />
      )}
      <div className="dvr-video-thumb-grain pointer-events-none absolute inset-0 z-1" aria-hidden />
      <div className="dvr-video-thumb-vignette pointer-events-none absolute inset-0 z-1" aria-hidden />
      <div className="dvr-video-media-glint pointer-events-none absolute inset-0 z-2" aria-hidden />
      <div className="dvr-video-media-veil pointer-events-none absolute inset-0 z-2" aria-hidden />
    </div>
  );
}

function DetailNewsRailCardInner({ item, index = 0, editorialLead = false }: Props) {
  const tone = assetNewsToVideoTone(item.category);
  const sent = assetNewsSentimentLabel(item.sentiment);
  const eager = index < 2;

  return (
    <Link
      href="/market-news"
      className={cn(
        "dvr-video-card dvr-video-card--premium group flex min-w-0 flex-col motion-entrance",
        `dvr-video-card--tone-${tone}`,
        "dvr-video-card--overlay-v2",
        editorialLead && "dvr-video-card--editorial-lead",
      )}
      style={motionEntranceDelay(index)}
    >
      <div className="dvr-video-media relative w-full overflow-hidden rounded-xl dvr-video-media--rail">
        <NewsThumb item={item} eager={eager} />
        <div className="dvr-video-tone-wash pointer-events-none absolute inset-0 z-2" aria-hidden />
        <div className="dvr-video-read-grad pointer-events-none absolute inset-x-0 bottom-0 z-3" aria-hidden />

        <div className="dvr-video-overlay-top">
          <div className="dvr-video-overlay-top__chips">
            <span className={cn("dvr-video-tag", `dvr-video-tag--${tone}`)}>
              {assetNewsCategoryLabel(item.category)}
            </span>
            <span className={cn("dvr-video-tag", `dvr-video-tag--${sent.tone}`)}>{sent.label}</span>
          </div>
          <span className={cn("dvr-duration-badge dvr-duration-badge--video", `dvr-duration-badge--${tone}`)}>
            {assetNewsImpactLabel(item.impact)}
          </span>
        </div>

        <div className="dvr-video-overlay-bottom">
          <p className="dvr-video-overlay-title line-clamp-3">{item.headline}</p>
          <div className="dvr-video-overlay-meta-row">
            <span
              className="dvr-video-overlay-avatar"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${tone === "crypto" ? "#a78bfa" : "#14b8a6"}ee, ${tone === "crypto" ? "#a78bfa" : "#14b8a6"}88)`,
              }}
              aria-hidden
            >
              {item.source.slice(0, 1)}
            </span>
            <p className="dvr-video-overlay-meta-copy">
              <span className="dvr-video-overlay-creator">{item.source}</span>
              <span className="dvr-video-overlay-sep" aria-hidden>
                ·
              </span>
              <span className="dvr-video-overlay-stats tabular-nums">{minutesAgoLabel(item.minutesAgo)}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const DetailNewsRailCard = memo(DetailNewsRailCardInner);
