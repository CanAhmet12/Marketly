"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { SignalDirectionPill } from "@/features/signals/components/unified-signal-primitives";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { getMarketNewsPhoto } from "@/features/markets/lib/market-news-shared";
import { fmtPrice } from "@/features/markets/lib/live-category/live-category-shared";
import type { MarketAssetView } from "@/features/markets/types";
import type { MarketNewsIntelligenceItem } from "@/features/markets/types/news-calendar-intelligence";
import { cn } from "@/lib/cn";
import type { CategoryPreview, RailNewsItem } from "@/features/home/editorial/build-editorial-rail";

import type { HomeVisualRailLink } from "./mock-data";
import {
  inferSymbolRailColor,
  RAIL_ACCENT_COLORS,
  RAIL_CATEGORY_COLORS,
  WATCHLIST_SUGGESTIONS,
} from "./rail-design-tokens";
import {
  IconRailBook,
  IconRailClock,
  IconRailCopy,
  IconRailLive,
  IconRailMood,
  IconRailSignalCount,
  IconRailUser,
  IconRailVerified,
  IconRailVolume,
  MoodTrendIcon,
  PctTrendIcon,
  QuickFilterIcon,
} from "./rail-icons";
import {
  estimateReadMinutes,
  isFreshNewsTime,
  moodScorePct,
  newsSentimentMeta,
} from "./rail-section-utils";
import { RailCreatorFollow } from "./rail-creator-follow";
import { RailSymbolIcon, RailTopicIcon } from "./rail-symbol-icon";

export const CATEGORY_COLORS: Record<string, string> = { ...RAIL_CATEGORY_COLORS };

export const NEWS_CAT_COLORS: Record<string, string> = {
  crypto: RAIL_CATEGORY_COLORS.crypto,
  macro: RAIL_CATEGORY_COLORS.stocks,
  earnings: "#34D399",
  flows: RAIL_CATEGORY_COLORS.index,
  local: RAIL_CATEGORY_COLORS.forex,
};

export const CATEGORY_ROUTES: Record<string, string> = {
  crypto: "/markets/category/crypto",
  stocks: "/markets/category/bist",
  forex: "/markets/category/forex",
  commodity: "/markets/category/commodities",
  index: "/markets/category/nasdaq",
};

const QUICK_FILTERS = [
  { id: "crypto", label: "Kripto", route: "/markets/category/crypto", color: CATEGORY_COLORS.crypto },
  { id: "stocks", label: "Hisse", route: "/markets/category/bist", color: CATEGORY_COLORS.stocks },
  { id: "forex", label: "Döviz", route: "/markets/category/forex", color: CATEGORY_COLORS.forex },
  { id: "signals", label: "Sinyaller", route: "/signals", color: RAIL_ACCENT_COLORS.signals },
  { id: "news", label: "Haberler", route: "/market-news", color: RAIL_ACCENT_COLORS.news },
] as const;

function railNewsPhoto(item: RailNewsItem): string {
  return getMarketNewsPhoto({
    id: item.id,
    newsCategory: item.newsCategory as MarketNewsIntelligenceItem["newsCategory"],
    imageUrl: item.imageUrl,
  });
}

function RailNewsImage({
  src,
  alt,
  className,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  if (src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} width={width} height={height} loading="lazy" />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={`${width}px`}
      priority={priority}
    />
  );
}

export function RailLiveDot({
  label = "Canlı",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span className="hv-ref-rail__live-tag hv-ref-rail__live-tag--dot-only" aria-label={label}>
        <span className="hv-ref-rail__live-dot" aria-hidden />
      </span>
    );
  }
  return (
    <span className="hv-ref-rail__live-tag" aria-label={label}>
      <IconRailLive className="hv-ref-rail__live-icon" size={11} />
      <span className="hv-ref-rail__live-dot" aria-hidden />
      {label}
    </span>
  );
}

/** Rail üstü — canlı veri akışı göstergesi */
export function RailLiveStrip() {
  return (
    <div className="hv-ref-rail__live-strip" role="status" aria-label="Canlı piyasa verisi">
      <span className="hv-ref-rail__live-strip-pulse" aria-hidden />
      <span className="hv-ref-rail__live-strip-track" aria-hidden>
        <span className="hv-ref-rail__live-strip-fill" />
      </span>
    </div>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  color?: string;
  badge?: ReactNode;
  subtitle?: string;
  live?: boolean;
  icon?: ReactNode;
};

/** Gömülü bölüm — kart duvarı yok, sol accent çizgisi */
export function RailSection({ title, children, action, color, badge, subtitle, live, icon }: SectionProps) {
  return (
    <section
      className="hv-ref-rail__block hv-ref-rail__section"
      aria-label={title}
      data-live={live || undefined}
      style={color ? ({ "--hv-cat-color": color } as React.CSSProperties) : undefined}
    >
      <span className="hv-ref-rail__block-accent" aria-hidden />
      <div className="hv-ref-rail__block-inner">
        <header className="hv-ref-rail__block-head">
          <div className="hv-ref-rail__section-title-col">
            <div className="hv-ref-rail__section-title-row">
              {icon ? <span className="hv-ref-rail__section-icon">{icon}</span> : null}
              <h3 className="hv-ref-rail__h">{title}</h3>
              {live ? <RailLiveDot compact /> : null}
              {badge ? <span className="hv-ref-rail__section-badge" aria-hidden>{badge}</span> : null}
            </div>
            {subtitle ? <p className="hv-ref-rail__section-sub">{subtitle}</p> : null}
          </div>
          {action ? <div className="hv-ref-rail__section-action">{action}</div> : null}
        </header>
        <div className="hv-ref-rail__block-body">{children}</div>
      </div>
    </section>
  );
}

export function QuickFilterPills() {
  return (
    <nav className="hv-ref-rail__quick-strip hv-ref-rail__quick-strip--scroll" aria-label="Hızlı kısayollar">
      <div className="hv-ref-rail__quick-strip-inner">
        {QUICK_FILTERS.map((f) => (
          <Link
            key={f.id}
            href={f.route}
            className="hv-ref-rail__quick-chip"
            style={{ "--hv-pill-color": f.color } as React.CSSProperties}
          >
            <QuickFilterIcon id={f.id} className="hv-ref-rail__quick-chip-icon" />
            {f.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function computeMarketMood(previews: CategoryPreview[]) {
  const upCount = previews.filter((c) => c.overallSign === "up").length;
  const downCount = previews.filter((c) => c.overallSign === "down").length;
  let mood: "bullish" | "bearish" | "mixed" | "flat" = "flat";
  if (upCount >= 3) mood = "bullish";
  else if (downCount >= 3) mood = "bearish";
  else if (upCount > 0 && downCount > 0) mood = "mixed";
  else if (upCount > downCount) mood = "bullish";
  else if (downCount > upCount) mood = "bearish";
  return { mood, upCount, downCount };
}

export function MarketMoodWidget({ previews }: { previews: CategoryPreview[] }) {
  if (previews.length === 0) return null;
  const { mood, upCount, downCount } = computeMarketMood(previews);

  const moodConfig = {
    bullish: { label: "Yükseliş", cls: "bullish" },
    bearish: { label: "Düşüş", cls: "bearish" },
    mixed: { label: "Karma", cls: "mixed" },
    flat: { label: "Nötr", cls: "flat" },
  }[mood];

  const bullPct = moodScorePct(upCount, downCount, previews.length);

  return (
    <div className="hv-ref-rail__mood hv-ref-rail__mood--live">
      <div className="hv-ref-rail__mood-header">
        <div className="hv-ref-rail__mood-title-row">
          <span className="hv-ref-rail__mood-label">
            <IconRailMood className="hv-ref-rail__inline-icon" size={14} />
            Piyasa Havası
          </span>
          <RailLiveDot label="Canlı" compact />
        </div>
        <div className="hv-ref-rail__mood-stats">
          <span className="hv-ref-rail__mood-score" data-tone={mood}>
            %{bullPct}
          </span>
          <span className={`hv-ref-rail__mood-pill hv-ref-rail__mood-pill--${moodConfig.cls}`}>
            <MoodTrendIcon mood={mood} className="hv-ref-rail__mood-pill-icon" />
            {moodConfig.label}
          </span>
        </div>
      </div>
      <div className="hv-ref-rail__mood-bar" aria-hidden>
        {previews.map((cat) => {
          const color = CATEGORY_COLORS[cat.id] ?? "var(--hv-meta)";
          const sign =
            cat.overallSign === "up" ? "up" : cat.overallSign === "down" ? "down" : "flat";
          return (
            <span
              key={cat.id}
              className="hv-ref-rail__mood-seg"
              data-sign={sign}
              style={{ "--hv-seg-color": color } as React.CSSProperties}
              title={cat.label}
            />
          );
        })}
      </div>
      <ul className="hv-ref-rail__mood-legend" aria-label="Kategori dağılımı">
        {previews.map((cat) => {
          const color = CATEGORY_COLORS[cat.id] ?? "var(--hv-meta)";
          const sign =
            cat.overallSign === "up" ? "up" : cat.overallSign === "down" ? "down" : "flat";
          return (
            <li key={cat.id} className="hv-ref-rail__mood-legend-item" data-sign={sign}>
              <span className="hv-ref-rail__mood-legend-dot" style={{ background: color }} aria-hidden />
              <span>{cat.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function accentToTrend(accent?: "up" | "down" | "neutral"): "up" | "down" | "flat" {
  if (accent === "up") return "up";
  if (accent === "down") return "down";
  return "flat";
}

function MarketRowContent({
  item,
  catColor,
  live,
}: {
  item: HomeVisualRailLink;
  catColor?: string;
  live?: boolean;
}) {
  const accent = item.accent === "up" ? "up" : item.accent === "down" ? "down" : "flat";
  const trend = item.sparkTrend ?? accentToTrend(item.accent);
  const spark = item.sparkline ?? [];

  return (
    <>
      <div className="hv-ref-rail__market-main">
        <div className="hv-ref-rail__market-sym-row">
          <RailSymbolIcon symbol={item.label} color={catColor} size={26} />
          {live ? <span className="hv-ref-rail__market-live" aria-hidden /> : null}
          <span
            className="hv-ref-rail__market-sym"
            style={catColor ? ({ "--hv-row-cat-color": catColor } as React.CSSProperties) : undefined}
          >
            {item.label}
          </span>
        </div>
        <div className="hv-ref-rail__market-sub-row">
          {item.price ? (
            <span className="hv-ref-rail__market-price hv-ref-rail__market-price--live">{item.price}</span>
          ) : null}
          {item.volumeLabel ? (
            <span className="hv-ref-rail__market-vol">
              <IconRailVolume className="hv-ref-rail__inline-icon" size={12} />
              {item.volumeLabel}
            </span>
          ) : null}
        </div>
        {item.assetName ? <span className="hv-ref-rail__market-name">{item.assetName}</span> : null}
      </div>
      <div className="hv-ref-rail__market-spark">
        {spark.length > 1 ? (
          <MiniSparkline series={spark} trend={trend} height={26} className="w-[68px]" />
        ) : (
          <span className="hv-ref-rail__market-spark-fallback" data-accent={accent} aria-hidden />
        )}
      </div>
      <div className="hv-ref-rail__market-tail">
        {item.meta ? (
          <span className="hv-ref-rail__market-pct" data-accent={accent}>
            <PctTrendIcon accent={accent} className="hv-ref-rail__pct-icon" />
            {item.meta}
          </span>
        ) : null}
        {(item.signalCount ?? 0) > 0 ? (
          <span className="hv-ref-rail__market-sigs" title={`${item.signalCount} aktif sinyal`}>
            <IconRailSignalCount className="hv-ref-rail__inline-icon" size={11} />
            <span className="hv-ref-rail__market-sigs-val">{item.signalCount}</span>
            <span className="hv-ref-rail__market-sigs-label">sinyal</span>
          </span>
        ) : null}
      </div>
    </>
  );
}

export function CategoryMarketRows({
  items,
  catColor,
  live = true,
}: {
  items: HomeVisualRailLink[];
  catColor?: string;
  live?: boolean;
}) {
  const rowStyle = catColor ? ({ "--hv-row-cat-color": catColor } as React.CSSProperties) : undefined;

  return (
    <ul className="hv-ref-rail__market-rows hv-ref-rail__market-rows--live" role="list">
      {items.map((item) => (
        <li key={item.label} role="listitem">
          {item.href ? (
            <Link href={item.href} className="hv-ref-rail__market-row group" style={rowStyle}>
              <MarketRowContent item={item} catColor={catColor} live={live} />
            </Link>
          ) : (
            <div className="hv-ref-rail__market-row" style={rowStyle}>
              <MarketRowContent item={item} catColor={catColor} live={live} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function signalDirClass(dir?: "BUY" | "SELL" | "HOLD"): string {
  if (dir === "BUY") return "buy";
  if (dir === "SELL") return "sell";
  return "hold";
}

function signalConfPct(conf: number): number {
  return Math.min(100, Math.max(16, (conf / 5) * 100));
}

function SignalConfidenceMeter({ conf, compact }: { conf: number; compact?: boolean }) {
  const pct = signalConfPct(conf);
  return (
    <div className={compact ? "hv-ref-rail__sig-conf hv-ref-rail__sig-conf--compact" : "hv-ref-rail__sig-conf"}>
      <div className="hv-ref-rail__sig-conf-head">
        <span className="hv-ref-rail__sig-conf-label">Güven skoru</span>
        <span className="hv-ref-rail__sig-conf-val">{conf}/5</span>
      </div>
      <div className="hv-ref-rail__sig-conf-track" aria-hidden>
        <span className="hv-ref-rail__sig-conf-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeaturedSignalCard({ item }: { item: HomeVisualRailLink }) {
  const dir = item.signalDirection ?? "HOLD";
  const trend = item.sparkTrend ?? (dir === "BUY" ? "up" : dir === "SELL" ? "down" : "flat");
  const conf = item.confidence ?? 3;

  return (
    <Link
      href={item.href ?? "/signals"}
      className="hv-ref-rail__sig-featured group"
      data-dir={signalDirClass(dir)}
    >
      <div className="hv-ref-rail__sig-featured-accent" aria-hidden />
      <div className="hv-ref-rail__sig-featured-top">
        <RailSymbolIcon symbol={item.label} size={34} />
        <div className="hv-ref-rail__sig-featured-ident">
          <div className="hv-ref-rail__sig-featured-sym-row">
            <span className="hv-ref-rail__sig-featured-sym">{item.label}</span>
            <SignalDirectionPill direction={dir} className="hv-ref-rail__sig-pill" />
            {item.timeframe ? (
              <span className="hv-ref-rail__sig-tf">{item.timeframe}</span>
            ) : null}
          </div>
          {item.assetName ? (
            <span className="hv-ref-rail__sig-featured-name">{item.assetName}</span>
          ) : null}
        </div>
        {item.sparkline && item.sparkline.length > 1 ? (
          <div className="hv-ref-rail__sig-featured-spark">
            <MiniSparkline series={item.sparkline} trend={trend} height={32} className="w-[72px]" />
          </div>
        ) : null}
      </div>
      {item.detail ? <p className="hv-ref-rail__sig-featured-entry">{item.detail}</p> : null}
      <div className="hv-ref-rail__sig-featured-foot">
        <SignalConfidenceMeter conf={conf} />
        {item.trendDelta ? (
          <span
            className="hv-ref-rail__sig-stat"
            data-accent={
              item.trendDeltaAccent === "up" ? "up" : item.trendDeltaAccent === "down" ? "down" : "flat"
            }
          >
            <IconRailCopy className="hv-ref-rail__inline-icon" size={12} />
            {item.trendDelta}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function CompactSignalRow({ item }: { item: HomeVisualRailLink }) {
  const dir = item.signalDirection ?? "HOLD";
  const trend = item.sparkTrend ?? (dir === "BUY" ? "up" : dir === "SELL" ? "down" : "flat");
  const conf = item.confidence ?? 3;

  return (
    <li className="hv-ref-rail__sig-compact" data-dir={signalDirClass(dir)}>
      <Link href={item.href ?? "/signals"} className="hv-ref-rail__sig-compact-link group">
        <RailSymbolIcon symbol={item.label} size={26} />
        <div className="hv-ref-rail__sig-compact-main">
          <div className="hv-ref-rail__sig-compact-head">
            <span className="hv-ref-rail__sig-compact-sym">{item.label}</span>
            <SignalDirectionPill direction={dir} className="hv-ref-rail__sig-pill hv-ref-rail__sig-pill--sm" />
            {item.timeframe ? <span className="hv-ref-rail__sig-tf">{item.timeframe}</span> : null}
          </div>
          {item.detail ? <span className="hv-ref-rail__sig-compact-detail">{item.detail}</span> : null}
        </div>
        {item.sparkline && item.sparkline.length > 1 ? (
          <MiniSparkline series={item.sparkline} trend={trend} height={22} className="w-[52px] shrink-0" />
        ) : null}
        <SignalConfidenceMeter conf={conf} compact />
      </Link>
    </li>
  );
}

export function SignalRailRows({ items }: { items: HomeVisualRailLink[] }) {
  const visible = items.slice(0, 5);
  const [featured, ...rest] = visible;
  if (!featured) return null;

  return (
    <div className="hv-ref-rail__signals-feed">
      <FeaturedSignalCard item={featured} />
      {rest.length > 0 ? (
        <ul className="hv-ref-rail__sig-compact-list" role="list">
          {rest.map((item) => (
            <CompactSignalRow key={`${item.label}-${item.href ?? item.rank ?? 0}`} item={item} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function RailNewsRows({ items }: { items: RailNewsItem[] }) {
  const visible = items.slice(0, 5);
  const [featured, ...rest] = visible;
  if (!featured) return null;

  const featuredColor = NEWS_CAT_COLORS[featured.newsCategory] ?? RAIL_ACCENT_COLORS.news;
  const featuredSentiment = newsSentimentMeta(featured.sentiment);
  const featuredFresh = isFreshNewsTime(featured.timeAgo);

  return (
    <div className="hv-ref-rail__news-feed">
      <a href={featured.href} className="hv-ref-rail__news-featured group">
        <div
          className="hv-ref-rail__news-featured-media"
          style={{ "--hv-news-cat": featuredColor } as React.CSSProperties}
        >
          <RailNewsImage
            src={railNewsPhoto(featured)}
            alt=""
            width={440}
            height={220}
            className="hv-ref-rail__news-featured-img"
            priority
          />
          <span className="hv-ref-rail__news-featured-overlay" aria-hidden />
          {featuredFresh ? (
            <span className="hv-ref-rail__news-fresh">
              <span className="hv-ref-rail__news-fresh-dot" aria-hidden />
              Az önce
            </span>
          ) : null}
          <span className="hv-ref-rail__news-featured-cat">{featured.categoryLabel}</span>
          {featured.relatedSymbol ? (
            <span className="hv-ref-rail__news-featured-sym">{featured.relatedSymbol}</span>
          ) : null}
        </div>
        <p className="hv-ref-rail__news-featured-title line-clamp-2">{featured.title}</p>
        <p className="hv-ref-rail__news-featured-meta">
          <span>{featured.source}</span>
          <span className="hv-ref-rail__meta-item">
            <IconRailClock className="hv-ref-rail__inline-icon" size={12} />
            {featured.timeAgo}
          </span>
          <span className="hv-ref-rail__meta-item">
            <IconRailBook className="hv-ref-rail__inline-icon" size={12} />
            {estimateReadMinutes(featured.title)} dk
          </span>
          {featuredSentiment ? (
            <>
              <span aria-hidden>·</span>
              <span className="hv-ref-rail__news-sentiment" data-tone={featuredSentiment.tone}>
                {featuredSentiment.label}
              </span>
            </>
          ) : null}
        </p>
      </a>

      {rest.length > 0 ? (
        <div className="hv-ref-rail__news-compact-list">
          {rest.map((item) => {
            const catColor = NEWS_CAT_COLORS[item.newsCategory] ?? "var(--hv-meta)";
            const sentiment = newsSentimentMeta(item.sentiment);
            return (
              <a key={item.id} href={item.href} className="hv-ref-rail__news-compact group">
                <div
                  className="hv-ref-rail__news-thumb"
                  style={{ "--hv-news-cat": catColor } as React.CSSProperties}
                >
                  <RailNewsImage
                    src={railNewsPhoto(item)}
                    alt=""
                    width={64}
                    height={64}
                    className="hv-ref-rail__news-thumb-img"
                  />
                </div>
                <div className="hv-ref-rail__news-compact-body">
                  <div className="hv-ref-rail__news-tags">
                    <span
                      className="hv-ref-rail__news-cat"
                      style={{ "--hv-news-cat": catColor } as React.CSSProperties}
                    >
                      {item.categoryLabel}
                    </span>
                    {item.relatedSymbol ? (
                      <span className="hv-ref-rail__news-symbol">{item.relatedSymbol}</span>
                    ) : null}
                  </div>
                  <p className="hv-ref-rail__news-title line-clamp-2">{item.title}</p>
                  <p className="hv-ref-rail__news-meta">
                    <span className="hv-ref-rail__news-source">{item.source}</span>
                    <span className="hv-ref-rail__news-dot" aria-hidden>·</span>
                    <span>{item.timeAgo}</span>
                    {sentiment ? (
                      <>
                        <span className="hv-ref-rail__news-dot" aria-hidden>·</span>
                        <span className="hv-ref-rail__news-sentiment" data-tone={sentiment.tone}>
                          {sentiment.label}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function InterestChipPills({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <div className="hv-ref-rail__interest-flow">
      {items.slice(0, 7).map((item) => (
        <Link
          key={item.label}
          href={`/discover?q=${encodeURIComponent(item.label)}`}
          className="hv-ref-rail__interest-chip"
          data-strength={item.chipStrength ?? "mid"}
        >
          <span className="hv-ref-rail__interest-chip-dot" data-strength={item.chipStrength ?? "mid"} aria-hidden />
          {item.label}
          {item.meta ? <span className="hv-ref-rail__interest-chip-meta">{item.meta}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}B`;
  return `${count}`;
}

export function CreatorRailRows({ items, viewerId }: { items: HomeVisualRailLink[]; viewerId: string | null }) {
  return (
    <div className="hv-ref-rail__creators hv-ref-rail__creators--flow">
      {items.map((item) => (
        <div key={item.creatorUserId ?? item.label} className="hv-ref-rail__creator hv-ref-rail__creator--flow">
          <div className="hv-ref-rail__creator-avatar hv-ref-rail__creator-avatar--live">
            {item.isOnline ? <span className="hv-ref-rail__creator-online" aria-label="Çevrimiçi" /> : null}
            {item.avatarUrl ? (
              <Image
                src={item.avatarUrl}
                alt=""
                width={44}
                height={44}
                sizes="44px"
                className="hv-ref-rail__creator-img"
              />
            ) : (
              <span className="hv-ref-rail__creator-placeholder" aria-hidden>
                {item.label.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="hv-ref-rail__creator-text">
            <div className="hv-ref-rail__creator-top">
              {item.creatorUserId ? (
                <Link href={`/channel/${item.creatorUserId}`} className="hv-ref-rail__creator-name hover:opacity-90">
                  {item.label}
                </Link>
              ) : (
                <span className="hv-ref-rail__creator-name">{item.label}</span>
              )}
              {item.verified ? (
                <span className="hv-ref-rail__creator-verified" aria-label="Doğrulanmış">
                  <IconRailVerified size={13} />
                </span>
              ) : null}
              {item.meta ? <span className="hv-ref-rail__creator-tier">{item.meta}</span> : null}
            </div>
            {item.handle ? <span className="hv-ref-rail__creator-handle">{item.handle}</span> : null}
            {item.expertise ? (
              <span className="hv-ref-rail__creator-expertise">{item.expertise}</span>
            ) : null}
            {(item.followerCount || item.signalCount) ? (
              <span className="hv-ref-rail__creator-sub">
                {item.followerCount ? `${formatFollowerCount(item.followerCount)} takipçi` : ""}
                {item.followerCount && item.signalCount ? " · " : ""}
                {item.signalCount ? (
                  <span className="hv-ref-rail__creator-sigs" title={`${item.signalCount} sinyal`}>
                    <IconRailSignalCount className="hv-ref-rail__inline-icon" size={11} />
                    {item.signalCount}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          {item.creatorUserId ? (
            <RailCreatorFollow creatorUserId={item.creatorUserId} viewerId={viewerId} />
          ) : (
            <Link href="/discover?tab=creators" className="hv-ref-rail__follow">
              Takip
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export function WatchlistPreview({
  symbols,
  assets,
}: {
  symbols: string[];
  assets: MarketAssetView[];
}) {
  if (symbols.length === 0) {
    return (
      <div className="hv-ref-rail__watchlist-empty">
        <p className="hv-ref-rail__watchlist-empty-text">Sembol ekle</p>
        <div className="hv-ref-rail__watchlist-suggest">
          {WATCHLIST_SUGGESTIONS.map((s) => (
            <Link
              key={s.symbol}
              href={`/markets/${encodeURIComponent(s.symbol)}`}
              className="hv-ref-rail__watchlist-suggest-chip"
              style={{ "--hv-suggest-color": s.color } as React.CSSProperties}
            >
              {s.symbol}
            </Link>
          ))}
        </div>
        <Link href="/watchlist" className="hv-ref-rail__action-link">
          Listeyi düzenle →
        </Link>
      </div>
    );
  }

  const assetMap = new Map(assets.map((a) => [a.symbol.toUpperCase(), a]));
  const rows = symbols.slice(0, 5).map((sym) => {
    const asset = assetMap.get(sym.toUpperCase());
    return { sym, asset };
  });

  return (
    <ul className="hv-ref-rail__watchlist hv-ref-rail__watchlist--rich" role="list">
      {rows.map(({ sym, asset }) => {
        const accent = asset
          ? asset.change_percent > 0.04
            ? "up"
            : asset.change_percent < -0.04
            ? "down"
            : "flat"
          : "flat";
        const pct = asset
          ? `${asset.change_percent >= 0 ? "+" : ""}${asset.change_percent.toFixed(2).replace(".", ",")}%`
          : "—";
        const price = asset ? fmtPrice(asset.price) : "—";
        const spark = asset?.sparkline ?? [];
        const trend = asset?.trend ?? "flat";

        return (
          <li key={sym} role="listitem">
            <Link
              href={asset ? `/markets/${encodeURIComponent(sym)}` : "/watchlist"}
              className="hv-ref-rail__watch-row group"
              style={{ "--hv-row-cat-color": inferSymbolRailColor(sym) } as React.CSSProperties}
            >
              <RailSymbolIcon symbol={sym} size={24} />
              <span className="hv-ref-rail__market-live hv-ref-rail__market-live--sm" aria-hidden />
              <span className="hv-ref-rail__watch-sym-wrap">
                <span className="hv-ref-rail__watch-sym">{sym}</span>
                {asset?.name ? <span className="hv-ref-rail__watch-name">{asset.name}</span> : null}
              </span>
              {spark.length > 1 ? (
                <MiniSparkline series={spark} trend={trend} height={22} className="w-[52px]" />
              ) : (
                <span className="hv-ref-rail__watch-spark-placeholder" aria-hidden />
              )}
              <span className="hv-ref-rail__watch-price">{price}</span>
              <span className="hv-ref-rail__watch-pct" data-accent={accent}>
                {pct}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TrendingDiscussionRows({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <ol className="hv-ref-rail__discuss-list hv-ref-rail__discuss-list--flow">
      {items.slice(0, 5).map((item) => {
        const da = item.trendDeltaAccent === "up" ? "up" : item.trendDeltaAccent === "down" ? "down" : "flat";
        const deltaNum = item.trendDelta ? parseInt(item.trendDelta.replace(/[^0-9]/g, ""), 10) || 30 : 30;
        const barW = Math.min(100, Math.max(12, deltaNum * 4));

        const inner = (
          <>
            <RailTopicIcon label={item.label} />
            <div className="hv-ref-rail__discuss-body">
              <span className="hv-ref-rail__discuss-tag">{item.label}</span>
              {item.meta ? <span className="hv-ref-rail__discuss-views">{item.meta}</span> : null}
              <div className="hv-ref-rail__discuss-bar-track" aria-hidden>
                <span className="hv-ref-rail__discuss-bar-fill" data-accent={da} style={{ width: `${barW}%` }} />
              </div>
            </div>
            {item.trendDelta ? (
              <span className="hv-ref-rail__discuss-delta" data-accent={da}>
                {item.trendDelta}
              </span>
            ) : null}
          </>
        );

        return (
          <li key={item.label} className="hv-ref-rail__discuss-row">
            {item.href ? (
              <Link href={item.href} className="hv-ref-rail__discuss-link group">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function TodayFeed({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <div className="hv-ref-rail__today-stack">
      {items.map((item) => (
        <div key={item.label} className="hv-ref-rail__event">
          <div className="hv-ref-rail__event-row">
            <span
              className={cn(
                "hv-ref-rail__event-cue",
                item.tone === "up" && "hv-ref-rail__event-cue--up",
                item.tone === "down" && "hv-ref-rail__event-cue--down",
              )}
              aria-hidden
            />
            <div className="hv-ref-rail__event-main">
              <div className="hv-ref-rail__event-line1">
                <span className="hv-ref-rail__event-title">{item.label}</span>
                {item.meta ? <span className="hv-ref-rail__event-time">{item.meta}</span> : null}
              </div>
              {item.detail ? <p className="hv-ref-rail__event-detail">{item.detail}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
