"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import {
  buildCryptoCommunityHub,
  stanceClass,
  stanceLabel,
  timelineKindLabel,
} from "@/features/markets/crypto/detail/lib/build-crypto-community-hub";
import type { CryptoCommunityMetric } from "@/features/markets/crypto/detail/lib/crypto-community-types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

type Props = { bundle: AssetIntelligenceBundle };

function feedSentimentClass(s: string): string {
  if (s === "bullish") return "cd-community-feed--bull";
  if (s === "bearish") return "cd-community-feed--bear";
  return "cd-community-feed--neutral";
}

function mediaKindLabel(kind: string): string {
  if (kind === "live") return "CANLI";
  if (kind === "short") return "SHORT";
  return "VİDEO";
}

function metricToneClass(tone?: CryptoCommunityMetric["tone"]): string | undefined {
  if (tone === "bull") return "cd-community-metric--bull";
  if (tone === "bear") return "cd-community-metric--bear";
  if (tone === "gold") return "cd-community-metric--gold";
  if (tone === "muted") return "cd-community-metric--muted";
  return undefined;
}

export function CryptoDetailCommunityHub({ bundle }: Props) {
  const hub = useMemo(() => buildCryptoCommunityHub(bundle), [bundle]);
  const featuredThesis = hub.thesisThreads[0];
  const moreThesis = hub.thesisThreads.slice(1);

  return (
    <section className="cd-community-v3" role="region" aria-label="Topluluk">

      <div className="cd-community-metrics" role="list">
        {hub.metrics.map((m) => (
          <div key={m.key} role="listitem" className={cn("cd-community-metric", metricToneClass(m.tone))}>
            <span className="cd-community-metric-label">{m.label}</span>
            <span className="cd-community-metric-value">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="cd-community-sentiment-row">
        <div className="cd-community-debate-bar cd-community-debate-bar--inline" aria-hidden>
          <div
            className="cd-community-debate-fill cd-community-debate-fill--bull"
            style={{ width: `${hub.debateBullPct}%` }}
          />
          <div
            className="cd-community-debate-fill cd-community-debate-fill--bear"
            style={{ width: `${hub.debateBearPct}%` }}
          />
        </div>
        <span className="cd-community-sentiment-label">
          %{hub.debateBullPct} boğa · %{hub.debateBearPct} ayı tartışma
        </span>
      </div>

      {hub.premiumDiscussionHint ? (
        <p className="cd-community-premium-hint">{hub.premiumDiscussionHint}</p>
      ) : null}

      {featuredThesis ? (
        <>
          <div className="cd-community-zone-rule" aria-hidden />
          <div className="cd-community-block">
            <h3 className="cd-community-block-title">Tez thread&apos;leri</h3>
            <Link href={featuredThesis.href} className="cd-community-featured-thesis">
              <div className="cd-community-thesis-main">
                <span className="cd-community-thesis-title">
                  {featuredThesis.title}
                  {featuredThesis.trending ? <span className="cd-community-trending">Trend</span> : null}
                </span>
                <span className="cd-community-thesis-meta">
                  {featuredThesis.participantCount} katılımcı · {formatTimeAgo(featuredThesis.lastActivityAt)}
                </span>
              </div>
              <span className={cn("cd-community-stance", stanceClass(featuredThesis.stance))}>
                {stanceLabel(featuredThesis.stance)}
              </span>
            </Link>
            {moreThesis.length > 0 ? (
              <ul className="cd-community-thesis-list cd-community-thesis-list--compact">
                {moreThesis.map((row) => (
                  <li key={row.id}>
                    <Link href={row.href} className="cd-community-thesis-row">
                      <span className="cd-community-thesis-title">{row.title}</span>
                      <span className="cd-community-thesis-meta">
                        {row.participantCount} katılımcı
                      </span>
                      <span className={cn("cd-community-stance", stanceClass(row.stance))}>
                        {stanceLabel(row.stance)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </>
      ) : null}

      {hub.feed.length > 0 ? (
        <>
          <div className="cd-community-zone-rule" aria-hidden />
          <div className="cd-community-block">
            <h3 className="cd-community-block-title">Tartışma akışı</h3>
            <ul className="cd-community-feed-list">
              {hub.feed.map((row) => (
                <li key={row.id}>
                  <Link href={row.href} className={cn("cd-community-feed-row", feedSentimentClass(row.sentiment))}>
                    <SafeAvatar src={row.avatarUrl} alt="" size={32} fallbackName={row.creatorDisplay} />
                    <div className="cd-community-feed-body">
                      <div className="cd-community-feed-head">
                        <span className="cd-community-feed-author">
                          {row.creatorDisplay}
                          {row.verified ? (
                            <span className="cd-community-verified" aria-label="Doğrulanmış">
                              ✓
                            </span>
                          ) : null}
                          {row.live ? <span className="cd-community-live">CANLI</span> : null}
                        </span>
                        <span className="cd-community-feed-kind">{row.kindLabel}</span>
                        <span className="cd-community-feed-time">{formatTimeAgo(row.createdAt)}</span>
                      </div>
                      <p className="cd-community-feed-content">{row.content}</p>
                      <div className="cd-community-feed-stats">
                        <span>{row.likes} beğeni</span>
                        <span>{row.replies} yanıt</span>
                        {row.tags.length > 0 ? (
                          <span className="cd-community-feed-tags">{row.tags.slice(0, 3).join(" · ")}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {hub.quotes.length > 0 ? (
        <>
          <div className="cd-community-zone-rule" aria-hidden />
          <div className="cd-community-block">
            <h3 className="cd-community-block-title">Öne çıkan alıntılar</h3>
            <ul className="cd-community-quote-list">
              {hub.quotes.map((q) => (
                <li key={q.href + q.quote.slice(0, 24)}>
                  <Link href={q.href} className="cd-community-quote-row">
                    <blockquote>{q.quote}</blockquote>
                    <cite>{q.source}</cite>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {hub.media.length > 0 ? (
        <>
          <div className="cd-community-zone-rule" aria-hidden />
          <div className="cd-community-block">
            <h3 className="cd-community-block-title">Medya</h3>
            <div className="cd-community-media-scroll">
              {hub.media.map((m) => (
                <Link key={m.id} href={m.href} className="cd-community-media-card">
                  <div className="cd-community-media-thumb">
                    {m.thumbnailUrl ? (
                      <Image src={m.thumbnailUrl} alt="" fill className="object-cover" sizes="200px" unoptimized />
                    ) : (
                      <span className="cd-community-media-fallback">{mediaKindLabel(m.kind)}</span>
                    )}
                    <span className="cd-community-media-kind">{mediaKindLabel(m.kind)}</span>
                    {m.durationLabel ? (
                      <span className="cd-community-media-duration">{m.durationLabel}</span>
                    ) : null}
                  </div>
                  <p className="cd-community-media-title">{m.title}</p>
                  <p className="cd-community-media-creator">{m.creatorDisplay}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="cd-community-zone-rule" aria-hidden />

      <div className="cd-community-block cd-community-narrative-compact">
        <h3 className="cd-community-block-title">Anlatı & ağ</h3>
        <p className="cd-community-narrative-text">{hub.crossAssetNarrative}</p>
        {hub.macroInterpretation ? (
          <p className="cd-community-narrative-text cd-community-narrative-text--macro">
            {hub.macroInterpretation}
          </p>
        ) : null}
        {(hub.sentimentOverlap || hub.capitalRotationHint) && (
          <div className="cd-community-network-hints">
            {hub.sentimentOverlap ? <span>{hub.sentimentOverlap}</span> : null}
            {hub.capitalRotationHint ? <span>{hub.capitalRotationHint}</span> : null}
          </div>
        )}
        {hub.correlatedPeers.length > 0 ? (
          <div className="cd-community-peer-chips">
            {hub.correlatedPeers.map((p) => (
              <Link key={p.symbol} href={p.href} className="cd-community-peer-chip">
                {p.symbol}
                <span className="cd-community-peer-corr">{p.correlationLabel}</span>
              </Link>
            ))}
          </div>
        ) : null}
        {hub.timeline.length > 0 ? (
          <ul className="cd-community-timeline cd-community-timeline--compact">
            {hub.timeline.map((entry) => (
              <li key={entry.id}>
                <Link href={entry.href} className="cd-community-timeline-row">
                  <span className="cd-community-timeline-kind">{timelineKindLabel(entry.kind)}</span>
                  <span className="cd-community-timeline-label">{entry.label}</span>
                  <span className="cd-community-timeline-time">{formatTimeAgo(entry.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
