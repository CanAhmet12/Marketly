import { resolveFeedPresentationKind } from "@/features/feed/domain/resolve-feed-presentation-kind";
import { isPulsePost, isSignalPost, isVideoLikePost } from "@/features/feed/feed-display";
import type { FeedPost } from "@/features/feed/types";
import type { HomeSection, HomeSectionItem } from "@/features/home/types";
import { homeHrefForFeedPost } from "@/features/home/routing";
import { getMockMarketPulseChips } from "@/mock/adapters/market-pulse";

/**
 * Mock ana akış ("Senin için"): yalnızca gönderi akışına bağlı bölümler.
 * Piyasa kartı / üretici ızgarası / haber özeti Keşfet ve Piyasalar sayfalarında;
 * burada tekrarlanmaz.
 */
export function getMockHomeSections(_viewerUserId: string | null, feedPosts: FeedPost[]): HomeSection[] {
  void _viewerUserId;
  const pulseItems: HomeSectionItem[] = getMockMarketPulseChips().map((c) => ({
    kind: "pulse_chip",
    label: c.label,
    href: c.href,
  }));

  const pulsePosts = feedPosts.filter((p) => isPulsePost(p)).slice(0, 14);
  let textPosts = feedPosts
    .filter((p) => !isVideoLikePost(p) && !isSignalPost(p))
    .filter((p) => resolveFeedPresentationKind(p) === "text_post" || (!p.thumbnail_url && !p.image_url))
    .slice(0, 10);
  if (textPosts.length < 3) {
    textPosts = feedPosts.filter((p) => !isVideoLikePost(p) && !isSignalPost(p)).slice(0, 10);
  }

  const sections: HomeSection[] = [];

  sections.push({
    id: "sec-pulse",
    type: "hero_market_pulse",
    title: "Sembol kısayolları",
    subtitle: "Arama veya Piyasalar sayfasına git",
    items: pulseItems,
    layout: "strip",
    priority: 10,
    seeAllHref: "/markets",
  });

  if (pulsePosts.length) {
    sections.push({
      id: "sec-pulse-rail",
      type: "pulse_rail",
      title: "Pulse",
      subtitle: "Kısa form dikey videolar",
      items: pulsePosts.map((post) => ({
        kind: "feed_post",
        post,
        href: homeHrefForFeedPost(post),
      })),
      layout: "rail_vertical_cards",
      priority: 25,
      seeAllHref: "/pulse",
    });
  }

  if (textPosts.length) {
    sections.push({
      id: "sec-text",
      type: "text_discussion_stack",
      title: "Tartışmalar",
      subtitle: "Metin odaklı gönderiler",
      items: textPosts.map((post) => ({
        kind: "feed_post",
        post,
        href: homeHrefForFeedPost(post),
      })),
      layout: "text_stack",
      priority: 60,
      seeAllHref: "/discover?tab=discussions",
    });
  }

  return sections.sort((a, b) => a.priority - b.priority);
}
