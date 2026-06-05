import type { SupabaseClient } from "@supabase/supabase-js";

import { isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import { homeHrefForFeedPost } from "@/features/home/routing";
import type { HomeSection, HomeSectionItem } from "@/features/home/types";

import { fetchLiveNowPosts, fetchRecommendedCreators, fetchTrendingSignals } from "./fetch-home-extras";

/** Feed + RPC/query ile home editorial section'ları üret */
export async function fetchHomeSectionsLive(
  client: SupabaseClient,
  feedPosts: FeedPost[],
): Promise<HomeSection[]> {
  const sections: HomeSection[] = [];

  const pulsePosts = feedPosts.filter((p) => isPulsePost(p)).slice(0, 14);
  if (pulsePosts.length) {
    sections.push({
      id: "sec-pulse-rail",
      type: "pulse_rail",
      title: "Pulse",
      subtitle: "Kısa form dikey videolar",
      items: pulsePosts.map((post) => ({
        kind: "feed_post" as const,
        post,
        href: homeHrefForFeedPost(post),
      })),
      layout: "rail_vertical_cards",
      priority: 25,
      seeAllHref: "/pulse",
    });
  }

  const textPosts = feedPosts
    .filter((p) => !isVideoLikePost(p) && !isSignalPost(p))
    .slice(0, 10);
  if (textPosts.length) {
    sections.push({
      id: "sec-text",
      type: "text_discussion_stack",
      title: "Tartışmalar",
      subtitle: "Metin odaklı gönderiler",
      items: textPosts.map((post) => ({
        kind: "feed_post" as const,
        post,
        href: homeHrefForFeedPost(post),
      })),
      layout: "text_stack",
      priority: 60,
      seeAllHref: "/discover?tab=discussions",
    });
  }

  const [trendingSignals, recommendedCreators, liveNow] = await Promise.all([
    fetchTrendingSignals(client, 8),
    fetchRecommendedCreators(client, 8),
    fetchLiveNowPosts(client, 6),
  ]);

  if (trendingSignals.length) {
    const items: HomeSectionItem[] = trendingSignals.map((s) => ({
      kind: "signal_row",
      row: {
        id: s.id,
        postId: s.id,
        symbol: s.symbol,
        direction: s.direction === "BUY" || s.direction === "SELL" || s.direction === "HOLD" ? s.direction : "HOLD",
        entry_price: s.entry_price,
        target_price: s.target_price,
        stop_loss: s.stop_loss,
        confidence: s.confidence,
        thesis: s.rationale ?? "",
        timeframe: s.timeframe,
        creator_id: s.creator_id,
        creator_name: s.creatorDisplay,
        creator_handle: `@${s.creator_id.slice(0, 8)}`,
        creator_avatar: s.creatorAvatarUrl,
        verified: false,
        chart_image_url: null,
      },
      href: `/signals?asset=${encodeURIComponent(s.symbol)}`,
    }));
    sections.push({
      id: "sec-signals",
      type: "signal_deck",
      title: "Aktif sinyaller",
      subtitle: "Haftalık öne çıkanlar",
      items,
      layout: "signal_deck",
      priority: 35,
      seeAllHref: "/signals",
    });
  }

  if (recommendedCreators.length) {
    sections.push({
      id: "sec-creators",
      type: "recommended_creators",
      title: "Önerilen üreticiler",
      subtitle: "Takip edebileceğin analistler",
      items: recommendedCreators.map((c) => ({
        kind: "creator_card" as const,
        creator: c,
        href: `/channel/${encodeURIComponent(c.id)}`,
      })),
      layout: "creator_grid",
      priority: 45,
      seeAllHref: "/creators",
    });
  }

  if (liveNow.length) {
    sections.push({
      id: "sec-live",
      type: "live_now",
      title: "Canlı yayın",
      subtitle: "Şu an aktif",
      items: liveNow.map((post) => ({
        kind: "feed_post" as const,
        post,
        href: homeHrefForFeedPost(post),
      })),
      layout: "rail_horizontal",
      priority: 30,
      seeAllHref: "/discover?tab=live",
    });
  }

  return sections.sort((a, b) => a.priority - b.priority);
}
