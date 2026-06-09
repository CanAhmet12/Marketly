"use client";

import type { FeedPost } from "@/features/feed/types";
import type { RecommendedCreatorCard } from "@/features/home/types";
import { fmtPct, fmtPrice } from "@/features/markets/lib/live-category/live-category-shared";
import type { MarketAssetView } from "@/features/markets/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";
import { avatarUrl } from "@/lib/avatar-url";
import { cn } from "@/lib/cn";

import { WELCOME_INTERESTS, type WelcomeSlide } from "./welcome-slides";
import type { WelcomeLiveData } from "./use-welcome-live-data";

function MiniSparkline({ values, up }: { values: number[]; up: boolean }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 96;
  const h = 36;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="welcome-spark" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? "#00e676" : "#ff6b6b"}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

function MarketsPanel({ assets }: { assets: MarketAssetView[] }) {
  const rows = assets.length > 0 ? assets.slice(0, 6) : FALLBACK_ASSETS;
  return (
    <div className="welcome-stage-panel">
      <header className="welcome-stage-head">
        <span className="welcome-live-dot is-green" />
        <span>Canlı piyasa terminali</span>
        <span className="welcome-stage-head__meta">asset_prices · {rows.length} sembol</span>
      </header>
      <div className="welcome-ticker">
        <div className="welcome-ticker__row welcome-ticker__row--head">
          <span>Sembol</span>
          <span>Trend</span>
          <span>Fiyat</span>
          <span>24s</span>
        </div>
        {rows.map((a) => (
          <div key={a.symbol} className="welcome-ticker__row">
            <div className="welcome-ticker__sym">
              <strong>{a.symbol}</strong>
              <em>{a.name}</em>
            </div>
            <MiniSparkline values={a.sparkline?.length ? a.sparkline : [a.price, a.price * 1.01]} up={a.change_percent >= 0} />
            <span className="welcome-ticker__price">{fmtPrice(a.price)}</span>
            <span className={cn("welcome-ticker__chg", a.change_percent >= 0 ? "is-up" : "is-down")}>
              {fmtPct(a.change_percent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedPanel({ posts }: { posts: FeedPost[] }) {
  const rows = posts.length > 0 ? posts : FALLBACK_POSTS;
  const hero = rows[0]!;
  const rest = rows.slice(1, 3);
  return (
    <div className="welcome-stage-panel">
      <header className="welcome-stage-head">
        <span className="welcome-live-dot is-violet" />
        <span>Sosyal finans akışı</span>
        <span className="welcome-stage-head__meta">posts · gerçek zamanlı</span>
      </header>
      <article className="welcome-feed-hero">
        <div className="welcome-feed-hero__head">
          <img
            src={hero.author_avatar || avatarUrl(hero.user_id, hero.author_name)}
            alt=""
            width={48}
            height={48}
            className="welcome-feed-avatar"
          />
          <div>
            <p className="welcome-feed-author">{hero.author_name}</p>
            <p className="welcome-feed-handle">{hero.author_handle}</p>
          </div>
          {hero.asset_tag ? <span className="welcome-feed-tag">{hero.asset_tag}</span> : null}
        </div>
        <p className="welcome-feed-hero__body">{truncate(hero.content, 200)}</p>
        <div className="welcome-feed-meta">
          <span>♥ {hero.likes}</span>
          <span>💬 {hero.comments}</span>
        </div>
      </article>
      {rest.length > 0 ? (
        <div className="welcome-feed-compact">
          {rest.map((p) => (
            <div key={p.id} className="welcome-feed-compact__row">
              <img
                src={p.author_avatar || avatarUrl(p.user_id, p.author_name)}
                alt=""
                width={32}
                height={32}
                className="welcome-feed-avatar welcome-feed-avatar--sm"
              />
              <div className="welcome-feed-compact__body">
                <span className="welcome-feed-compact__author">{p.author_name}</span>
                <p>{truncate(p.content, 90)}</p>
              </div>
              <span className="welcome-feed-compact__stat">♥ {p.likes}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SignalsPanel({ signals }: { signals: DiscoverSignalCardRow[] }) {
  const rows = (signals.length > 0 ? signals : FALLBACK_SIGNALS).slice(0, 4);
  return (
    <div className="welcome-stage-panel">
      <header className="welcome-stage-head">
        <span className="welcome-live-dot is-rose" />
        <span>Topluluk sinyalleri</span>
        <span className="welcome-stage-head__meta">get_top_signals</span>
      </header>
      <div className="welcome-signal-list">
        {rows.map((s) => (
          <div key={s.id} className="welcome-signal-strip">
            <span
              className={cn(
                "welcome-signal-dir",
                s.direction === "BUY" ? "is-long" : s.direction === "SELL" ? "is-short" : "",
              )}
            >
              {s.direction}
            </span>
            <div className="welcome-signal-strip__main">
              <span className="welcome-signal-sym">{s.symbol}</span>
              <span className="welcome-signal-creator">{s.creatorDisplay}</span>
            </div>
            <div className="welcome-signal-strip__stats">
              <span>★ {Math.min(5, Math.max(1, Math.round(s.confidence)))}/5</span>
              <span>{s.copies_count} kopya</span>
            </div>
            {s.entry_price != null ? (
              <p className="welcome-signal-prices">
                {fmtPrice(s.entry_price)}
                {s.target_price != null ? ` → ${fmtPrice(s.target_price)}` : ""}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalPanel({
  creators,
  selected,
  onToggle,
}: {
  creators: RecommendedCreatorCard[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const list = (creators.length > 0 ? creators : FALLBACK_CREATORS).slice(0, 4);
  return (
    <div className="welcome-stage-panel">
      <header className="welcome-stage-head">
        <span className="welcome-live-dot is-cyan" />
        <span>Kişisel zeka</span>
        <span className="welcome-stage-head__meta">for you · keşfet</span>
      </header>
      <p className="welcome-personal-label">İlgi alanın</p>
      <div className="welcome-chips welcome-chips--inline">
        {WELCOME_INTERESTS.map((chip) => {
          const on = selected.has(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              className={cn("welcome-chip welcome-chip--inline", on && "is-selected")}
              onClick={() => onToggle(chip.id)}
            >
              <span>{chip.icon}</span> {chip.label}
            </button>
          );
        })}
      </div>
      <p className="welcome-personal-label">Önerilen analistler</p>
      <div className="welcome-creator-list">
        {list.map((c) => (
          <div key={c.id} className="welcome-creator-row">
            <img src={c.avatar_url || avatarUrl(c.id, c.name)} alt="" width={40} height={40} className="welcome-creator-avatar" />
            <div className="welcome-creator-row__info">
              <p className="welcome-creator-name">{c.name}</p>
              <p className="welcome-creator-meta">
                {c.handle}
                {c.signal_accuracy ? ` · %${Math.round(c.signal_accuracy)} doğruluk` : ""}
              </p>
            </div>
            {c.verified ? <span className="welcome-creator-badge">✓</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WelcomePreviewPanel({
  slide,
  data,
  loading,
  selectedInterests,
  onToggleInterest,
}: {
  slide: WelcomeSlide;
  data: WelcomeLiveData | undefined;
  loading: boolean;
  selectedInterests: Set<string>;
  onToggleInterest: (id: string) => void;
}) {
  return (
    <div className={cn("welcome-stage", loading && "is-loading")} data-scene={slide.scene}>
      <div className="welcome-stage__content">
        {slide.scene === "markets" ? <MarketsPanel assets={data?.assets ?? []} /> : null}
        {slide.scene === "social" ? <FeedPanel posts={data?.posts ?? []} /> : null}
        {slide.scene === "signals" ? <SignalsPanel signals={data?.signals ?? []} /> : null}
        {slide.scene === "personal" ? (
          <PersonalPanel creators={data?.creators ?? []} selected={selectedInterests} onToggle={onToggleInterest} />
        ) : null}
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  const t = s.trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

const FALLBACK_ASSETS: MarketAssetView[] = [
  { id: "1", symbol: "BTC", name: "Bitcoin", price: 67420, change_percent: 2.41, volume: "24B", trend: "up", category: "crypto", marketCapLabel: "", sparkline: [65000, 66200, 65800, 67100, 67420], signal_active_count: 12, signal_bull_pct: 68, signal_top_analyst: null },
  { id: "2", symbol: "ETH", name: "Ethereum", price: 3512, change_percent: -1.12, volume: "12B", trend: "down", category: "crypto", marketCapLabel: "", sparkline: [3600, 3550, 3520, 3490, 3512], signal_active_count: 8, signal_bull_pct: 52, signal_top_analyst: null },
  { id: "3", symbol: "AAPL", name: "Apple", price: 198.4, change_percent: 0.84, volume: "8B", trend: "up", category: "stocks", marketCapLabel: "", sparkline: [195, 196, 197, 198, 198.4], signal_active_count: 3, signal_bull_pct: 60, signal_top_analyst: null },
];

const FALLBACK_POSTS: FeedPost[] = [
  { id: "f1", user_id: "u1", content: "BTC 67K üzeri tutunursa risk-on devam — haftalık kapanış kritik.", asset_tag: "BTC", image_url: null, type: "post", video_url: null, thumbnail_url: null, title: null, likes: 145, comments: 23, created_at: "", author_name: "Can A.", author_handle: "@cananalist", author_avatar: null, author_tier: "pro", is_liked: false, is_saved: false, media_urls: null, mentioned_users: null, link_preview: null, quoted_post_id: null, quoted_post: null },
];

const FALLBACK_SIGNALS: DiscoverSignalCardRow[] = [
  { id: "s1", creator_id: "c1", asset_id: "btc", symbol: "BTC", direction: "BUY", confidence: 4, entry_price: 66500, target_price: 72000, stop_loss: null, timeframe: "1G", rationale: null, is_active: true, copies_count: 847, likes_count: 120, created_at: "", result: null, creatorDisplay: "CryptoGuru", creatorAvatarUrl: null },
  { id: "s2", creator_id: "c2", asset_id: "eth", symbol: "ETH", direction: "BUY", confidence: 5, entry_price: 3400, target_price: 3800, stop_loss: null, timeframe: "1G", rationale: null, is_active: true, copies_count: 412, likes_count: 88, created_at: "", result: null, creatorDisplay: "ETH Master", creatorAvatarUrl: null },
  { id: "s3", creator_id: "c3", asset_id: "xau", symbol: "XAU", direction: "SELL", confidence: 4, entry_price: 2340, target_price: 2280, stop_loss: null, timeframe: "4S", rationale: null, is_active: true, copies_count: 289, likes_count: 45, created_at: "", result: null, creatorDisplay: "FX Wizard", creatorAvatarUrl: null },
];

const FALLBACK_CREATORS: RecommendedCreatorCard[] = [
  {
    id: "c1",
    name: "CryptoGuru",
    handle: "@cryptoguru",
    avatar_url: null,
    bio: null,
    tier: "pro",
    verified: true,
    follower_count: 12000,
    expertise: "Kripto",
    signal_count: 48,
    signal_accuracy: 72,
  },
];
