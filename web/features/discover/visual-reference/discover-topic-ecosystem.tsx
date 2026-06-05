"use client";

import { cn } from "@/lib/cn";
import {
  VR_LIVE_ITEMS,
  VR_PULSE_ITEMS,
  VR_VIDEO_ITEMS,
  vrPickByIds,
  type VRLiveItem,
  type VRPulseItem,
  type VRTopicEcosystem,
  type VRTopicMood,
  type VRVideoItem,
} from "./discover-visual-reference-data";
import { DiscoverLiveCardCompact } from "./discover-live-card";
import { DiscoverPulseCard, type PulseVariant } from "./discover-pulse-card";
import { DiscoverVideoCard } from "./discover-video-card";

const MOOD_KICKER: Record<VRTopicMood, string> = {
  fed: "Makro masası",
  btc: "Kripto radarı",
  gold: "Emtia",
  bist: "BIST",
  crypto: "Kripto radarı",
  macro: "Makro masası",
};

const PULSE_VARIANT_CYCLE: PulseVariant[] = ["breaking", "trending", "default"];

type TopicTile =
  | { kind: "live"; item: VRLiveItem }
  | { kind: "video"; item: VRVideoItem }
  | { kind: "pulse"; item: VRPulseItem };

/** 3×2 grid: önce live–video–pulse iki turu, kalanı pulse→video→live ile doldur */
function buildTopicSixTiles(topic: VRTopicEcosystem): TopicTile[] {
  const lives = vrPickByIds(VR_LIVE_ITEMS, topic.liveIds);
  const pulses = vrPickByIds(VR_PULSE_ITEMS, topic.pulseIds);
  const videos = vrPickByIds(VR_VIDEO_ITEMS, topic.videoIds);
  const L = [...lives];
  const P = [...pulses];
  const V = [...videos];
  const pattern: Array<"live" | "video" | "pulse"> = [
    "live",
    "video",
    "pulse",
    "live",
    "video",
    "pulse",
  ];
  const out: TopicTile[] = [];
  const take = (k: "live" | "video" | "pulse"): boolean => {
    const pool = k === "live" ? L : k === "video" ? V : P;
    const item = pool.shift();
    if (!item) return false;
    if (k === "live") out.push({ kind: "live", item: item as VRLiveItem });
    else if (k === "video") out.push({ kind: "video", item: item as VRVideoItem });
    else out.push({ kind: "pulse", item: item as VRPulseItem });
    return true;
  };
  for (const p of pattern) {
    if (!take(p)) {
      let filled = false;
      for (const k of ["pulse", "video", "live"] as const) {
        if (take(k)) {
          filled = true;
          break;
        }
      }
      if (!filled) break;
    }
  }
  while (out.length < 6) {
    if (take("pulse")) continue;
    if (take("video")) continue;
    if (take("live")) continue;
    break;
  }
  return out.slice(0, 6);
}

export function TopicEcosystemCluster({ topic }: { topic: VRTopicEcosystem }) {
  const tiles = buildTopicSixTiles(topic);

  return (
    <section
      className={cn("dvr-topic-cluster", `dvr-topic-cluster--${topic.mood}`)}
      aria-label={`${topic.title} keşif kümesi`}
    >
      <div className="dvr-topic-cluster__shell">
        <header className="dvr-topic-cluster__header">
          <span className="dvr-topic-cluster__kicker">{MOOD_KICKER[topic.mood]}</span>
          <h2 className="dvr-topic-cluster__title">{topic.title}</h2>
          <p className="dvr-topic-cluster__tagline">{topic.tagline}</p>
          <div className="dvr-topic-cluster__tags">
            {topic.marketTags.map((tag) => (
              <span key={tag} className="dvr-topic-cluster__tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="dvr-topic-cluster__grid" role="list">
          {tiles.map((tile, i) => (
            <div key={`${tile.kind}-${tile.item.id}-${i}`} className="dvr-topic-cluster__tile" role="listitem">
              {tile.kind === "live" ? (
                <DiscoverLiveCardCompact item={tile.item} index={i} topicTile />
              ) : tile.kind === "video" ? (
                <DiscoverVideoCard item={tile.item} index={i} topicTile />
              ) : (
                <DiscoverPulseCard
                  item={tile.item}
                  tier="standard"
                  index={i}
                  variant={PULSE_VARIANT_CYCLE[i % PULSE_VARIANT_CYCLE.length]}
                  density="rail"
                  topicTile
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
