"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";
import type { CategoryPreview, RailNewsItem } from "@/features/home/editorial/build-editorial-rail";

import type { HomeVisualRailLink } from "./mock-data";
import { RAIL_ACCENT_COLORS } from "./rail-design-tokens";
import {
  IconRailChevronRight,
  PctTrendIcon,
  RAIL_SECTION_ICONS,
} from "./rail-icons";
import {
  CATEGORY_COLORS,
  CATEGORY_ROUTES,
  CategoryMarketRows,
  CreatorRailRows,
  InterestChipPills,
  MarketMoodWidget,
  QuickFilterPills,
  RailLiveStrip,
  RailNewsRows,
  RailSection,
  SignalRailRows,
  TrendingDiscussionRows,
  WatchlistPreview,
} from "./rail-modules";

function RailSectionIcon({ id, color }: { id: keyof typeof RAIL_SECTION_ICONS; color?: string }) {
  const Icon = RAIL_SECTION_ICONS[id];
  return (
    <Icon
      className="hv-ref-rail__section-icon-svg"
      size={17}
      {...(color ? { style: { color } } : {})}
    />
  );
}

function RailActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="hv-ref-rail__action-link hv-ref-rail__action-link--icon">
      <span>{label}</span>
      <IconRailChevronRight className="hv-ref-rail__action-chevron" size={13} />
    </Link>
  );
}

type Props = {
  shortcuts: HomeVisualRailLink[];
  today: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  signals: HomeVisualRailLink[];
  discussions: HomeVisualRailLink[];
  creators: HomeVisualRailLink[];
  categoryPreviews: CategoryPreview[];
  newsItems: RailNewsItem[];
  liveAssets?: MarketAssetView[];
  viewerId?: string | null;
};

export function HomeVisualRightRail({
  shortcuts,
  today,
  interests,
  signals,
  discussions,
  creators,
  categoryPreviews,
  newsItems,
  liveAssets = [],
  viewerId = null,
}: Props) {
  const { watchlist, hydrated } = useMarketsWatchlist();

  const watchSymbols = useMemo(() => (hydrated ? [...watchlist].slice(0, 5) : []), [hydrated, watchlist]);

  const showCategoryPreviews = categoryPreviews.length > 0;
  const showToday = !showCategoryPreviews && today.length > 0;
  const hasSignals = signals.length > 0;
  const hasDiscussions = discussions.length > 0;

  const hasRichContent =
    showCategoryPreviews ||
    today.length > 0 ||
    signals.length > 0 ||
    creators.length > 0 ||
    interests.length > 0 ||
    newsItems.length > 0;

  const showShortcuts = shortcuts.length > 0 && !hasRichContent;

  return (
    <div className={cn("hv-ref-rail", "hv-ref-rail--rich", "hv-ref-rail--v3", "hv-ref-rail--v4", "hv-ref-rail--v5", "hv-ref-rail--v6", "hv-ref-rail--v7", "hv-ref-rail--v8", "hv-ref-rail--v9", "hv-ref-rail--v10")}>
      <RailLiveStrip />
      <QuickFilterPills />

      {showCategoryPreviews ? <MarketMoodWidget previews={categoryPreviews} /> : null}

      {showCategoryPreviews
        ? categoryPreviews.map((cat) => {
            const catColor = CATEGORY_COLORS[cat.id] ?? RAIL_ACCENT_COLORS.primary;
            const catRoute = CATEGORY_ROUTES[cat.id] ?? "/markets";
            const signAccent =
              cat.overallSign === "up" ? "up" : cat.overallSign === "down" ? "down" : "flat";
            const sectionIconId = (cat.id in RAIL_SECTION_ICONS ? cat.id : "stocks") as keyof typeof RAIL_SECTION_ICONS;

            return (
              <RailSection
                key={cat.id}
                title={cat.label}
                color={catColor}
                live
                icon={<RailSectionIcon id={sectionIconId} color={catColor} />}
                badge={
                  <span className="hv-ref-rail__cat-sign">
                    <PctTrendIcon accent={signAccent} className="hv-ref-rail__cat-sign-icon" />
                  </span>
                }
                action={<RailActionLink href={catRoute} label="Tümü" />}
              >
                <CategoryMarketRows items={cat.items} catColor={catColor} />
              </RailSection>
            );
          })
        : null}

      {showToday ? (
        <RailSection
          title="Hareketli piyasalar"
          color={RAIL_ACCENT_COLORS.primary}
          live
          icon={<RailSectionIcon id="movers" color={RAIL_ACCENT_COLORS.primary} />}
          action={<RailActionLink href="/markets" label="Tümü" />}
        >
          <CategoryMarketRows items={today} catColor={RAIL_ACCENT_COLORS.primary} />
        </RailSection>
      ) : null}

      {hasSignals ? (
        <RailSection
          title="Aktif sinyaller"
          color={RAIL_ACCENT_COLORS.signals}
          live
          icon={<RailSectionIcon id="signals" color={RAIL_ACCENT_COLORS.signals} />}
          action={<RailActionLink href="/signals" label="Sinyal pazarı" />}
        >
          <SignalRailRows items={signals} />
        </RailSection>
      ) : null}

      {hydrated ? (
        <RailSection
          title="İzleme listesi"
          color={RAIL_ACCENT_COLORS.watchlist}
          live={watchSymbols.length > 0}
          icon={<RailSectionIcon id="watchlist" color={RAIL_ACCENT_COLORS.watchlist} />}
          action={<RailActionLink href="/watchlist" label="Listeyi aç" />}
        >
          <WatchlistPreview symbols={watchSymbols} assets={liveAssets} />
        </RailSection>
      ) : null}

      {newsItems.length > 0 ? (
        <RailSection
          title="Piyasa haberleri"
          color={RAIL_ACCENT_COLORS.news}
          icon={<RailSectionIcon id="news" color={RAIL_ACCENT_COLORS.news} />}
          action={<RailActionLink href="/market-news" label="Tümü" />}
        >
          <RailNewsRows items={newsItems} />
        </RailSection>
      ) : null}

      {hasDiscussions ? (
        <RailSection
          title="Trend konular"
          color={RAIL_ACCENT_COLORS.discussions}
          icon={<RailSectionIcon id="discussions" color={RAIL_ACCENT_COLORS.discussions} />}
          action={<RailActionLink href="/discover" label="Keşfet" />}
        >
          <TrendingDiscussionRows items={discussions} />
        </RailSection>
      ) : null}

      {creators.length > 0 ? (
        <RailSection
          title="Öne çıkan analistler"
          color={RAIL_ACCENT_COLORS.creators}
          icon={<RailSectionIcon id="creators" color={RAIL_ACCENT_COLORS.creators} />}
          action={<RailActionLink href="/creators" label="Tümünü gör" />}
        >
          <CreatorRailRows items={creators.slice(0, 4)} viewerId={viewerId} />
        </RailSection>
      ) : null}

      {interests.length > 0 ? (
        <RailSection
          title="İlgi alanların"
          color={RAIL_ACCENT_COLORS.interests}
          icon={<RailSectionIcon id="interests" color={RAIL_ACCENT_COLORS.interests} />}
          action={<RailActionLink href="/settings" label="Düzenle" />}
        >
          <InterestChipPills items={interests} />
        </RailSection>
      ) : null}

      {showShortcuts ? (
        <RailSection
          title="Piyasa kısayolları"
          color={RAIL_ACCENT_COLORS.primary}
          action={
            <Link href="/markets" className="hv-ref-rail__action-link">
              Tümü →
            </Link>
          }
        >
          <CategoryMarketRows items={shortcuts} catColor={RAIL_ACCENT_COLORS.primary} />
        </RailSection>
      ) : null}

      {creators.length === 0 && signals.length === 0 && hasRichContent ? (
        <RailSection title="Topluluğu keşfet" color={RAIL_ACCENT_COLORS.creators}>
          <div className="hv-ref-rail__discover-links">
            <Link href="/creators" className="hv-ref-rail__action-link block">
              Analistleri keşfet →
            </Link>
            <Link href="/signals" className="hv-ref-rail__action-link block">
              Sinyalleri keşfet →
            </Link>
          </div>
        </RailSection>
      ) : null}
    </div>
  );
}
