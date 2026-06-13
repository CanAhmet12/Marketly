"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { KeyboardEvent, RefObject } from "react";

import { ChannelRecommendationRail } from "@/features/channel/components/channel-recommendation-rail";
import { ChannelWriteGateNotice } from "@/features/channel/components/channel-write-gate-notice";
import { fmtCount, tierChip } from "@/features/channel/channel-display-helpers";
import type { ChannelProfile, ChannelTabId, FollowState } from "@/features/channel/types";
import { analystBadgeLabelTr } from "@/features/signals/intelligence/badge-labels";
import type { AnalystReputationProfile } from "@/features/signals/intelligence/types";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { cn } from "@/lib/cn";
import { messagesInboxWithPeer } from "@/features/messages/routes";

type TabDef = { id: ChannelTabId; label: string };

type Props = {
  profile: ChannelProfile;
  channelUserId: string;
  displayName: string;
  handle: string;
  avatarSrc: string;
  followersShown: number;
  followingShown: number;
  isOwn: boolean;
  embeddedInHub?: boolean;
  viewerId: string | null;
  channelLoginNext: string;
  socialWriteEnabled: boolean;
  follow: FollowState;
  followPending: boolean;
  followLoading: boolean;
  followErr: string | null;
  onFollowClick: () => void;
  onOpenFollowList: (kind: "followers" | "following") => void;
  channelAnalystReputation: AnalystReputationProfile | null;
  tabs: TabDef[];
  tab: ChannelTabId;
  tabCounts: Partial<Record<ChannelTabId, number>>;
  tabRefs: RefObject<Partial<Record<ChannelTabId, HTMLButtonElement | null>>>;
  onSelectTab: (id: ChannelTabId) => void;
  onTabKeyDown: (e: KeyboardEvent<HTMLButtonElement>, current: ChannelTabId) => void;
};

export function ChannelHero({
  profile,
  channelUserId,
  displayName,
  handle,
  avatarSrc,
  followersShown,
  followingShown,
  isOwn,
  embeddedInHub,
  viewerId,
  channelLoginNext,
  socialWriteEnabled,
  follow,
  followPending,
  followLoading,
  followErr,
  onFollowClick,
  onOpenFollowList,
  channelAnalystReputation,
  tabs,
  tab,
  tabCounts,
  tabRefs,
  onSelectTab,
  onTabKeyDown,
}: Props) {
  const tier = tierChip(profile.tier ?? "free");

  return (
    <>
      {embeddedInHub ? (
        <div className="ch-hub-chrome">
          <span className="hp-kicker">{hubPremiumKicker("profile")}</span>
        </div>
      ) : null}

      <div className="ch-profile-header">
        <div className="ch-cover">
          {profile.cover_url?.trim() ? (
            <img src={profile.cover_url} alt="" className="ch-cover-img" />
          ) : (
            <div className="ch-cover-gradient" />
          )}
          <div className="ch-cover-fade" />
        </div>

        <div className="ch-hero">
          <div className="ch-hero-head">
          <div className="ch-avatar-wrap">
            <img src={avatarSrc} alt="" className="ch-avatar" />
          </div>

          <div className="ch-identity">
            <div className="ch-name-row">
              <h1 className="ch-name">{displayName}</h1>
              {profile.verified ? <span className="ch-verified-badge">VERIFIED</span> : null}
              {tier.label ? (
                <span className={cn("ch-tier-badge", tier.label === "ELITE" ? "ch-tier-elite" : "ch-tier-pro")}>
                  {tier.label}
                </span>
              ) : null}
            </div>

            <div className="ch-handle-row">
              <span className="ch-handle">{handle}</span>
              {profile.strategy_style ? (
                <>
                  <span className="ch-handle-sep">·</span>
                  <span className="ch-strategy">{profile.strategy_style}</span>
                </>
              ) : null}
              {profile.location ? (
                <>
                  <span className="ch-handle-sep">·</span>
                  <span className="ch-location">{profile.location}</span>
                </>
              ) : null}
            </div>

            {profile.bio?.trim() ? <p className="ch-bio">{profile.bio}</p> : null}

            {profile.specialties && profile.specialties.length > 0 ? (
              <div className="ch-specialties">
                {profile.specialties.map((s) => (
                  <span key={s} className="ch-spec">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="ch-actions">
            {isOwn ? (
              <>
                {!embeddedInHub ? (
                  <Link href="/hub/profile" className="ch-btn ch-btn--ghost">
                    Profil
                  </Link>
                ) : null}
                <Link href="/hub/settings?section=profil" className="ch-btn ch-btn--ghost">
                  Profili Düzenle
                </Link>
                <Link href="/hub/studio" className="ch-btn ch-btn--ghost">
                  Studio
                </Link>
                <Link href="/hub/upload" className="ch-btn ch-btn--primary">
                  İçerik Ekle
                </Link>
              </>
            ) : (
              <>
                {!socialWriteEnabled ? (
                  <ChannelWriteGateNotice compact className="ch-write-gate-notice ch-write-gate-notice--inline" />
                ) : null}
                <button
                  type="button"
                  onClick={onFollowClick}
                  disabled={followPending || followLoading || !socialWriteEnabled}
                  className={cn("ch-btn", follow.isFollowing ? "ch-btn--following" : "ch-btn--follow")}
                  aria-pressed={follow.isFollowing}
                  aria-label={follow.isFollowing ? "Takibi bırak" : "Takip et"}
                  title={!socialWriteEnabled ? "Salt-okuma modu" : undefined}
                >
                  {follow.isFollowing ? "Takiptesin" : "Takip Et"}
                </button>
                <Link
                  href={
                    viewerId
                      ? messagesInboxWithPeer(channelUserId)
                      : `/auth/login?next=${encodeURIComponent(channelLoginNext)}`
                  }
                  className="ch-btn ch-btn--ghost"
                >
                  Mesaj
                </Link>
                {profile.subscription_price ? (
                  <Link
                    href={`/subscriptions/${encodeURIComponent(channelUserId)}`}
                    className="ch-btn ch-btn--subscribe"
                  >
                    Abone Ol · ₺{profile.subscription_price}/ay
                  </Link>
                ) : null}
              </>
            )}
            {followErr ? <span className="ch-follow-err">{followErr}</span> : null}
          </div>

          <div className="ch-stats-row">
            <button
              type="button"
              className="ch-stat ch-stat--clickable"
              onClick={() => onOpenFollowList("followers")}
              aria-label={`${fmtCount(followersShown)} takipçi — listeyi aç`}
            >
              <span className="ch-stat-value">{fmtCount(followersShown)}</span>
              <span className="ch-stat-label">Takipçi</span>
            </button>
            <button
              type="button"
              className="ch-stat ch-stat--clickable"
              onClick={() => onOpenFollowList("following")}
              aria-label={`${fmtCount(followingShown)} takip — listeyi aç`}
            >
              <span className="ch-stat-value">{fmtCount(followingShown)}</span>
              <span className="ch-stat-label">Takip</span>
            </button>
            {profile.total_views ? (
              <div className="ch-stat">
                <span className="ch-stat-value">{fmtCount(profile.total_views)}</span>
                <span className="ch-stat-label">Görüntülenme</span>
              </div>
            ) : null}
            {profile.signal_accuracy != null ? (
              <div className="ch-stat">
                <span className="ch-stat-value">%{profile.signal_accuracy}</span>
                <span className="ch-stat-label">Sinyal Doğruluk</span>
              </div>
            ) : null}
            {profile.subscriber_count > 0 ? (
              <div className="ch-stat">
                <span className="ch-stat-value">{fmtCount(profile.subscriber_count)}</span>
                <span className="ch-stat-label">Abone</span>
              </div>
            ) : null}
          </div>
        </div>

        {channelAnalystReputation ? (
          <div className="ch-reputation">
            <div className="ch-reputation-title">Sinyal İtibarı</div>
            <div className="ch-reputation-headline">{channelAnalystReputation.headline}</div>
            <div className="ch-reputation-scores">
              <span className="ch-rep-score">Güven {channelAnalystReputation.scores.trustScore}</span>
              <span className="ch-rep-score">Tutarlılık {channelAnalystReputation.scores.consistencyScore}</span>
              <span className="ch-rep-score">
                Risk-adj {channelAnalystReputation.scores.riskAdjustedPerformance}
              </span>
            </div>
            {channelAnalystReputation.badges.length > 0 ? (
              <div className="ch-rep-badges">
                {channelAnalystReputation.badges.map((b) => (
                  <span key={b} className="ch-rep-badge">
                    {analystBadgeLabelTr(b)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="ch-tabs" role="tablist" aria-label="Kanal sekmeleri">
          {tabs.map(({ id, label }) => {
            const count = tabCounts[id];
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                id={`ch-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={tab === id}
                aria-controls={`ch-panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => onSelectTab(id)}
                onKeyDown={(e) => onTabKeyDown(e, id)}
                className={cn("ch-tab", tab === id && "ch-tab--active")}
              >
                <span>{label}</span>
                {count != null && count > 0 ? <span className="ch-tab-count">{fmtCount(count)}</span> : null}
              </button>
            );
          })}
        </div>

        {!embeddedInHub ? (
          <ChannelRecommendationRail
            viewerId={viewerId}
            channelUserId={channelUserId}
            specialties={profile.specialties}
          />
        ) : null}
        </div>
      </div>
    </>
  );
}
