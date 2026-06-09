"use client";

import Link from "next/link";
import { useState } from "react";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { cn } from "@/lib/cn";
import {
  VR_CREATOR_ITEMS,
  VR_CREATOR_ACTIVITY_FEED,
  VR_MARKET_TOPIC_CHIPS,
  type VRCreatorActivityBadge,
  type VRCreatorActivityLine,
  type VRCreatorItem,
  type VRDeskHeat,
  type VRMarketTopicChip,
} from "./discover-visual-reference-data";

export type CreatorGraphNode = { item: VRCreatorItem; context: string };

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/45 motion-reduce:animate-none" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400/90" />
    </span>
  );
}

const BADGE_COPY: Record<VRCreatorActivityBadge, string> = {
  live: "Canlı",
  trend: "Trend",
  new: "Yeni",
  hot: "Çok izlenen",
};

function FaceBadge({ kind }: { kind: VRCreatorActivityBadge }) {
  const cls =
    kind === "live"
      ? "dvr-face-badge dvr-face-badge--live"
      : kind === "trend"
        ? "dvr-face-badge dvr-face-badge--trend"
        : kind === "new"
          ? "dvr-face-badge dvr-face-badge--new"
          : "dvr-face-badge dvr-face-badge--hot";
  return <span className={cls}>{BADGE_COPY[kind]}</span>;
}

const HEAT_COPY: Record<VRDeskHeat, string> = {
  hot: "Sıcak",
  rising: "Yükseliyor",
  watch: "Takipte",
  risk: "Riskli",
  new: "Yeni",
};

function MarketBlockHead({
  title,
  subtitle,
  seeAllHref,
  compact,
}: {
  title: string;
  subtitle: string;
  seeAllHref?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("dvr-mkt-block__head", compact && "dvr-mkt-block__head--chrome")}>
      <div className="dvr-mkt-block__head-main">
        <h2 className={cn("dvr-mkt-block__title", compact && "dvr-mkt-block__title--chrome")}>{title}</h2>
        <p className={cn("dvr-mkt-block__subtitle", compact && "dvr-mkt-block__subtitle--chrome")}>{subtitle}</p>
      </div>
      {seeAllHref ? (
        <Link href={seeAllHref} className={cn("dvr-mkt-block__see-all", compact && "dvr-mkt-block__see-all--chrome")}>
          <span>Tümünü gör</span>
          <span className="dvr-mkt-block__see-all-arrow" aria-hidden>
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

function FacePortrait({
  item,
  sizePx,
  className,
}: {
  item: VRCreatorItem;
  sizePx: number;
  className?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = item.portraitUrl?.trim() ?? "";
  const show = url.length > 0 && !imgFailed;

  return (
    <div
      className={cn("dvr-face-item__photo-wrap relative overflow-hidden rounded-full", className)}
      style={{ width: sizePx, height: sizePx }}
      aria-hidden
    >
      {show ? (
        <img
          src={url}
          alt=""
          width={sizePx}
          height={sizePx}
          className="absolute inset-0 z-1 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : null}
      <span
        className={cn(
          "absolute inset-0 z-0 flex items-center justify-center rounded-full font-bold text-white",
          show && "opacity-0",
        )}
        style={{
          fontSize: sizePx * 0.34,
          background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}f0, ${item.avatarColor}7a)`,
        }}
      >
        {item.avatarInitial}
      </span>
    </div>
  );
}

const DEFAULT_FACE_SUB = "Canlı yorumlar ve bugün öne çıkan piyasa aktörleri.";
const DEFAULT_TOPIC_SUB = "Bugün yön arayan başlıklar.";

/** Piyasayı Konuşanlar — yüz odaklı yatay creator rail */
export function CreatorFaceRail({
  label = "Piyasayı Konuşanlar",
  subtitle = DEFAULT_FACE_SUB,
  seeAllHref = DISCOVER_VERTICAL_ROUTES.creators,
  hideSeeAll = false,
  compact = false,
  creators = VR_CREATOR_ITEMS,
  activityRows = VR_CREATOR_ACTIVITY_FEED,
}: {
  label?: string;
  subtitle?: string;
  seeAllHref?: string;
  hideSeeAll?: boolean;
  /** Üst chrome — başlıksız kompakt people rail */
  compact?: boolean;
  creators?: VRCreatorItem[];
  activityRows?: VRCreatorActivityLine[];
}) {
  const rows = compact ? activityRows : activityRows.slice(0, 8);
  const avatarPx = compact ? 52 : 64;

  return (
    <section
      className={cn("dvr-mkt-block dvr-mkt-block--face-rail", compact && "dvr-mkt-block--chrome")}
      aria-label={label}
    >
      <div className={cn("dvr-mkt-block__shell", compact && "dvr-mkt-block__shell--chrome")}>
        <MarketBlockHead
          title={label}
          subtitle={subtitle}
          seeAllHref={hideSeeAll ? undefined : seeAllHref}
          compact={compact}
        />
        <div className={cn("dvr-face-rail", compact && "dvr-face-rail--chrome")}>
          <div className={cn("dvr-face-rail__mask", compact && "dvr-face-rail__mask--chrome")}>
            <div
              className={cn(
                "dvr-face-rail__track scrollbar-none",
                "flex shrink-0 flex-nowrap overflow-x-auto pb-0.5",
                compact ? "gap-3.5" : "gap-5",
                "[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              )}
            >
              {rows.map((row, i) => {
                const item = creators.find((c) => c.id === row.creatorId);
                if (!item) return null;
                const tone = row.badge === "live" ? "live" : row.tileTone;
                return (
                  <Link
                    key={`${row.creatorId}-${i}-${row.headline}`}
                    href={item.href}
                    className={cn(
                      "dvr-face-item group shrink-0",
                      `dvr-face-item--tone-${tone}`,
                      compact && "dvr-face-item--chrome",
                    )}
                    aria-label={`${item.displayName}: ${row.railContext}`}
                  >
                    <div className="dvr-face-item__halo" aria-hidden />
                    <div className={cn("dvr-face-item__ring", `dvr-face-item__ring--${row.badge}`)}>
                      <FacePortrait item={item} sizePx={avatarPx} className="dvr-face-item__photo" />
                      {item.isLive && row.badge === "live" ? (
                        <span className="dvr-face-item__live-dot" aria-hidden />
                      ) : null}
                    </div>
                    <FaceBadge kind={row.badge} />
                    <span className="dvr-face-item__name truncate">{item.displayName}</span>
                    <p className={cn("dvr-face-item__context", compact ? "line-clamp-1" : "line-clamp-2")}>
                      {row.railContext}
                    </p>
                    {!compact ? <span className="dvr-face-item__cta">{row.cta}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopicChip({ chip, rail }: { chip: VRMarketTopicChip; rail?: boolean }) {
  const tick = chip.tickers.join(" · ");
  return (
    <Link
      href={chip.href}
      className={cn(
        "dvr-topic-chip group",
        `dvr-topic-chip--${chip.accent}`,
        rail && "dvr-topic-chip--rail-row",
        !rail && chip.size === "lg" && "dvr-topic-chip--lg",
        !rail && chip.size === "sm" && "dvr-topic-chip--sm",
        !rail && chip.size === "md" && "dvr-topic-chip--md",
      )}
      aria-label={`${chip.title} · ${tick}`}
    >
      <span className="dvr-topic-chip__accent" aria-hidden />
      <span className="dvr-topic-chip__title">{chip.title}</span>
      <span className="dvr-topic-chip__tickers">{tick}</span>
      <span className={cn("dvr-topic-chip__heat", `dvr-topic-chip__heat--${chip.heat}`)}>{HEAT_COPY[chip.heat]}</span>
    </Link>
  );
}

/** Masadaki Konular — topic chip board (compact üst şeritte yatay rail) */
export function TopicChipBoard({
  label = "Masadaki Konular",
  subtitle = DEFAULT_TOPIC_SUB,
  seeAllHref = DISCOVER_VERTICAL_ROUTES.pulse,
  compact = false,
  chips = VR_MARKET_TOPIC_CHIPS,
}: {
  label?: string;
  subtitle?: string;
  seeAllHref?: string;
  compact?: boolean;
  chips?: VRMarketTopicChip[];
}) {
  return (
    <section
      className={cn("dvr-mkt-block dvr-mkt-block--topic-board", compact && "dvr-mkt-block--chrome")}
      aria-label={label}
    >
      <div className={cn("dvr-mkt-block__shell", compact && "dvr-mkt-block__shell--chrome")}>
        <MarketBlockHead title={label} subtitle={subtitle} seeAllHref={seeAllHref} compact={compact} />
        {compact ? (
          <div className="dvr-topic-rail-chrome">
            <div className="dvr-topic-rail-chrome__mask">
              <div
                className={cn(
                  "dvr-topic-rail-chrome__track scrollbar-none",
                  "flex shrink-0 flex-nowrap gap-2 overflow-x-auto py-0.5",
                  "[-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                {chips.map((c) => (
                  <TopicChip key={c.id} chip={c} rail />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="dvr-topic-board">
            {chips.map((c) => (
              <TopicChip key={c.id} chip={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CreatorNetworkStrip({
  nodes,
  label = "Üretici grafiği",
}: {
  nodes: CreatorGraphNode[];
  label?: string;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="dvr-creator-graph" aria-label={label}>
      <p className="dvr-creator-graph__eyebrow">{label}</p>
      <div className="dvr-creator-graph__track">
        {nodes.map(({ item, context }, i) => (
          <div key={item.id} className={cn("dvr-creator-graph__node", i % 2 === 1 && "dvr-creator-graph__node--alt")}>
            <Link href={item.href} className="dvr-creator-graph__link group">
              <span
                className={cn(
                  "dvr-creator-graph__avatar flex items-center justify-center rounded-full font-bold text-white",
                  item.isLive ? "ring-2 ring-red-500/55" : "ring-1 ring-white/12",
                )}
                style={{
                  width: 40,
                  height: 40,
                  background: `radial-gradient(circle at 35% 35%, ${item.avatarColor}ee, ${item.avatarColor}88)`,
                  fontSize: 16,
                }}
                aria-hidden
              >
                {item.avatarInitial}
              </span>
              <span className="dvr-creator-graph__name truncate">{item.displayName}</span>
              <span className="dvr-creator-graph__context line-clamp-2">{context}</span>
              <span className="dvr-creator-graph__meta flex items-center gap-1.5">
                {item.isLive ? (
                  <>
                    <LiveDot />
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-red-300/85">Canlı</span>
                  </>
                ) : (
                  <span className="dvr-creator-graph__meta tabular-nums text-[9px]">{item.followers}</span>
                )}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
