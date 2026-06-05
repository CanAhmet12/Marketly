"use client";

import type { HomeEngagementHandlers } from "@/features/home/home-engagement";
import { CreatorGridSection } from "@/features/home/sections/creator-grid-section";
import { HeroMarketPulseSection } from "@/features/home/sections/hero-market-pulse-section";
import { LiveNowSection } from "@/features/home/sections/live-now-section";
import { MarketMoversSection } from "@/features/home/sections/market-movers-section";
import { NewsBriefingSection } from "@/features/home/sections/news-briefing-section";
import { ShortsRailSection } from "@/features/home/sections/shorts-rail-section";
import { SignalDeckSection } from "@/features/home/sections/signal-deck-section";
import { TextDiscussionSection } from "@/features/home/sections/text-discussion-section";
import { VideoGridSection } from "@/features/home/sections/video-grid-section";
import type { HomeSection } from "@/features/home/types";

type Props = {
  sections: HomeSection[];
  engagement: HomeEngagementHandlers;
};

export function HomeSectionRenderer({ sections, engagement }: Props) {
  return (
    <div className="mt-[var(--sp-2)] flex flex-col">
      {sections.map((section) => {
        switch (section.type) {
          case "hero_market_pulse":
            return <HeroMarketPulseSection key={section.id} section={section} />;
          case "video_grid":
            return <VideoGridSection key={section.id} section={section} engagement={engagement} />;
          case "live_now":
            return <LiveNowSection key={section.id} section={section} engagement={engagement} />;
          case "pulse_rail":
            return <ShortsRailSection key={section.id} section={section} engagement={engagement} />;
          case "signal_deck":
            return <SignalDeckSection key={section.id} section={section} />;
          case "text_discussion_stack":
            return <TextDiscussionSection key={section.id} section={section} engagement={engagement} />;
          case "market_movers":
            return <MarketMoversSection key={section.id} section={section} />;
          case "recommended_creators":
          case "followed_creators":
            return <CreatorGridSection key={section.id} section={section} engagement={engagement} />;
          case "news_briefing":
            return <NewsBriefingSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
