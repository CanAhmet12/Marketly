"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { IconComment, IconHeart } from "@/features/markets/crypto/symbol-detail/components/detail-icons";
import { DetailSectionHead } from "@/features/markets/crypto/symbol-detail/components/detail-section-head";
import type {
  AssetDiscussionItem,
  AssetDiscussionKind,
  AssetIntelligenceBundle,
} from "@/features/markets/types/asset-intelligence";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  variant?: "main" | "sidebar" | "wide";
};

const HASH_MENTION_RE = /(#[A-Za-z0-9ğüşöçıİĞÜŞÖÇ_]+|@[A-Za-zğüşöçıİĞÜŞÖÇ0-9_]+)/g;

function kindLabel(kind?: AssetDiscussionKind): string | null {
  if (!kind) return null;
  const map: Record<AssetDiscussionKind, string> = {
    thesis: "Tez",
    update: "Güncelleme",
    debate: "Tartışma",
    macro: "Makro",
    signal_followup: "Sinyal",
    quote: "Alıntı",
    cross_asset: "Çapraz",
  };
  return map[kind] ?? null;
}

function kindClass(kind?: AssetDiscussionKind): string {
  if (!kind) return "";
  return `cdr-community-post__kind--${kind.replace("_", "-")}`;
}

function formatTimeAgo(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 48) {
      return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    }
    if (hours > 0) return `${hours} saat önce`;
    if (mins > 0) return `${mins} dk önce`;
    return "Az önce";
  } catch {
    return "Az önce";
  }
}

function sentimentClass(sentiment: AssetDiscussionItem["sentiment"]): string {
  if (sentiment === "bullish") return "cdr-community-post--bull";
  if (sentiment === "bearish") return "cdr-community-post--bear";
  return "cdr-community-post--neutral";
}

function stanceLabel(sentiment: AssetDiscussionItem["sentiment"]): string {
  if (sentiment === "bullish") return "Boğa";
  if (sentiment === "bearish") return "Ayı";
  return "Nötr";
}

function CommunityContentText({ text }: { text: string }) {
  const parts = text.split(HASH_MENTION_RE);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          return (
            <span key={`${part}-${index}`} className="cdr-community-post__hash">
              {part}
            </span>
          );
        }
        if (part.startsWith("@")) {
          return (
            <span key={`${part}-${index}`} className="cdr-community-post__mention">
              {part}
            </span>
          );
        }
        return <span key={`t-${index}`}>{part}</span>;
      })}
    </>
  );
}

function CommunityPostRow({ post }: { post: AssetDiscussionItem }) {
  const kind = kindLabel(post.kind);
  const avatarSrc =
    post.avatarUrl && post.avatarUrl.trim().length > 0
      ? post.avatarUrl
      : fallbackAvatar(post.creatorId, post.creatorDisplay);

  return (
    <article
      className={cn(
        "cdr-community-post",
        sentimentClass(post.sentiment),
        post.live && "cdr-community-post--live",
      )}
    >
      <Link href={post.href} className="cdr-community-post__card">
        <div className="cdr-community-post__head">
          <SafeAvatar
            src={avatarSrc}
            alt=""
            size={40}
            className="cdr-community-post__avatar"
          />
          <div className="cdr-community-post__meta">
            <div className="cdr-community-post__name-row">
              <span className="cdr-community-post__name">{post.creatorDisplay}</span>
              {post.verified ? <span className="cdr-community-post__verified">✓</span> : null}
              {kind ? (
                <span className={cn("cdr-community-post__kind", kindClass(post.kind))}>{kind}</span>
              ) : null}
              {post.live ? <span className="cdr-community-post__live-pill">Canlı</span> : null}
            </div>
            <div className="cdr-community-post__handle">
              <span>@{post.creatorUsername}</span>
              <span className="cdr-community-post__handle-sep" aria-hidden>
                ·
              </span>
              <time dateTime={post.createdAt}>{formatTimeAgo(post.createdAt)}</time>
            </div>
          </div>
          <span
            className={cn(
              "cdr-community-post__stance",
              post.sentiment === "bullish" && "cdr-up",
              post.sentiment === "bearish" && "cdr-down",
            )}
          >
            {stanceLabel(post.sentiment)}
          </span>
        </div>

        <div className="cdr-community-post__bubble">
          <p className="cdr-community-post__body">
            <CommunityContentText text={post.content} />
          </p>
        </div>

        {post.tags.length > 0 ? (
          <div className="cdr-community-post__chips">
            {post.tags.map((tag) => (
              <span key={tag} className="cdr-community-post__chip">
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        ) : null}

        <div className="cdr-community-post__engage">
          <span className="cdr-community-post__engage-item cdr-community-post__engage-item--like">
            <IconHeart size={17} />
            <strong>{post.likes}</strong>
          </span>
          <span className="cdr-community-post__engage-item">
            <IconComment size={17} />
            <strong>{post.replies}</strong>
            <em>yorum</em>
          </span>
        </div>
      </Link>
    </article>
  );
}

function CommunityChatFeed({
  posts,
  compact = false,
  wide = false,
}: {
  posts: AssetDiscussionItem[];
  compact?: boolean;
  wide?: boolean;
}) {
  const streamRef = useRef<HTMLDivElement>(null);
  const bullCount = posts.filter((p) => p.sentiment === "bullish").length;
  const bearCount = posts.filter((p) => p.sentiment === "bearish").length;
  const liveCount = posts.filter((p) => p.live).length;
  const bullPct = posts.length ? Math.round((bullCount / posts.length) * 100) : 0;
  const bearPct = posts.length ? Math.round((bearCount / posts.length) * 100) : 0;
  const neutralPct = Math.max(0, 100 - bullPct - bearPct);

  useEffect(() => {
    const node = streamRef.current;
    if (!node || node.classList.contains("cdr-community-canvas--settled")) return;
    const id = window.setTimeout(() => node.classList.add("cdr-community-canvas--settled"), 900);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      ref={streamRef}
      className={cn(
        "cdr-community-canvas",
        compact && "cdr-community-canvas--compact",
        wide && "cdr-community-canvas--wide",
      )}
    >
      <div className="cdr-community__bento" role="list">
        <div className="cdr-community__tile cdr-community__tile--bull" role="listitem">
          <span className="cdr-community__tile-accent" aria-hidden />
          <div className="cdr-community__tile-body">
            <span className="cdr-community__tile-k">Boğa görüşü</span>
            <span className="cdr-community__tile-v">{bullPct}%</span>
            <span className="cdr-community__tile-sub">{bullCount} gönderi</span>
          </div>
        </div>
        <div className="cdr-community__tile cdr-community__tile--bear" role="listitem">
          <span className="cdr-community__tile-accent" aria-hidden />
          <div className="cdr-community__tile-body">
            <span className="cdr-community__tile-k">Ayı görüşü</span>
            <span className="cdr-community__tile-v">{bearPct}%</span>
            <span className="cdr-community__tile-sub">{bearCount} gönderi</span>
          </div>
        </div>
        <div className="cdr-community__tile cdr-community__tile--posts" role="listitem">
          <span className="cdr-community__tile-accent" aria-hidden />
          <div className="cdr-community__tile-body">
            <span className="cdr-community__tile-k">Toplam akış</span>
            <span className="cdr-community__tile-v">{posts.length}</span>
            <span className="cdr-community__tile-sub">gönderi</span>
          </div>
        </div>
        <div className="cdr-community__tile cdr-community__tile--live" role="listitem">
          <span className="cdr-community__tile-accent" aria-hidden />
          <div className="cdr-community__tile-body">
            <span className="cdr-community__tile-k">Canlı tartışma</span>
            <span className="cdr-community__tile-v">{liveCount > 0 ? liveCount : "Aktif"}</span>
            <span className="cdr-community__tile-sub">
              {liveCount > 0 ? "canlı gönderi" : "akış açık"}
            </span>
          </div>
        </div>
      </div>

      <div className="cdr-community__sentiment" aria-hidden>
        <span className="cdr-community__sentiment-bull" style={{ width: `${bullPct}%` }} />
        <span className="cdr-community__sentiment-bear" style={{ width: `${bearPct}%` }} />
        <span className="cdr-community__sentiment-neutral" style={{ width: `${neutralPct}%` }} />
      </div>

      <div className="cdr-community__feed">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="cdr-community__feed-item"
            style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
          >
            <CommunityPostRow post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailCommunitySection({ bundle, variant = "main" }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const isWide = variant === "wide";
  const isSidebar = variant === "sidebar";
  const limit = isWide ? 12 : isSidebar ? 4 : 6;
  const posts = bundle.discussions.slice(0, limit);
  if (posts.length === 0) return null;

  return (
    <section
      className={cn(
        isSidebar ? "cdr-section cdr-sidebar-community" : "cdr-section",
        isWide && "cdr-community-section--wide",
      )}
      data-zone="community"
      aria-label="Topluluk fikirleri"
      id={isSidebar || isWide ? "community" : undefined}
    >
      <DetailSectionHead
        seriesKicker="Topluluk"
        label="Topluluk Fikirleri"
        accent="live"
        seeAllHref={`/search?q=${encodeURIComponent(sym)}`}
        seeAllLabel="Tüm topluluğu gör"
      />
      <div className="cdr-section-body">
        <CommunityChatFeed posts={posts} compact={isSidebar} wide={isWide} />
      </div>
    </section>
  );
}
