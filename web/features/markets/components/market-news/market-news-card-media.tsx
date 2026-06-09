"use client";

import { useState } from "react";

import { RemoteCoverImage } from "@/components/ui/remote-cover-image";
import { getMarketNewsPhoto } from "@/features/markets/lib/market-news-shared";
import type { NewsCardTone } from "@/features/markets/lib/news-card-tones";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";

type NewsItemWithImage = MarketNewsIntelligenceItem & { imageUrl?: string | null };

type Props = {
  item: NewsItemWithImage;
  tone: NewsCardTone;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function MarketNewsCardMedia({
  item,
  tone,
  priority = false,
  sizes = "(max-width: 720px) 92vw, 420px",
  className,
}: Props) {
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const photo = getMarketNewsPhoto(item);
  const remote = isRemoteUrl(photo);

  return (
    <div className={cn("mn-card-media", className)}>
      {remote ? (
        <RemoteCoverImage
          src={photo}
          alt=""
          className="mn-card-media__photo"
          sizes={sizes}
          priority={priority}
          onFailed={() => setFallbackFailed(true)}
        />
      ) : !fallbackFailed ? (
        <img
          src={photo}
          alt=""
          className="mn-card-media__photo"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFallbackFailed(true)}
        />
      ) : null}

      <div
        className={cn("mn-card-media__well", `mn-card-media__well--${tone}`)}
        aria-hidden
      />
      <div className="mn-card-tone-wash pointer-events-none absolute inset-0 z-[2]" aria-hidden />
      <div className="mn-card-read-grad pointer-events-none absolute inset-x-0 bottom-0 z-[3]" aria-hidden />
      <div className="mn-card-media-glint pointer-events-none absolute inset-0 z-[2]" aria-hidden />
    </div>
  );
}
