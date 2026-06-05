"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useState } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { pickMockOfflineThumbnail } from "@/mock/media/pick-mock-offline-thumbnail";

type Props = {
  creator: CreatorDirectoryRow;
};

export function CreatorsLiveAvatar({ creator }: Props) {
  const [hover, setHover] = useState(false);
  const thumb = creator.latestThumbnailUrl ?? pickMockOfflineThumbnail(`${creator.id}|live-strip|live`);
  const href = creator.liveHref ?? creator.channelHref;

  const onEnter = useCallback(() => setHover(true), []);
  const onLeave = useCallback(() => setHover(false), []);

  return (
    <Link
      href={href}
      className="creators-page__live-item group"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <div className="creators-page__live-thumb-wrap">
        <img
          src={thumb}
          alt=""
          className={`creators-page__live-thumb ${hover ? "creators-page__live-thumb--hover" : ""}`}
          loading="lazy"
        />
        <SafeAvatar
          src={creator.avatarUrl ?? ""}
          alt=""
          size={36}
          className="creators-page__live-avatar-overlay"
        />
        <span className="creators-page__live-pill">CANLI</span>
        <span className="creators-page__live-ring" aria-hidden />
      </div>
      <span className="creators-page__live-name truncate">{creator.displayName}</span>
      <span className="creators-page__live-meta truncate">
        {creator.signalAccuracy != null ? `%${creator.signalAccuracy} isabet · ` : ""}
        {formatCompactCount(creator.followerCount)} takipçi
      </span>
    </Link>
  );
}
