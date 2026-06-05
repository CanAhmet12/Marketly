"use client";

import { DiscussionDiscoveryIntelPanel } from "@/features/social/components/discussion-discovery-intel-panel";
import { isMockDataEnabled } from "@/mock/config";

/** Keşfet — tartışma keşif + istihbarat (SocialRepository). */
export function DiscoverDiscussionIntelligenceStrip() {
  if (!isMockDataEnabled()) return null;
  return (
    <div className="mb-4">
      <DiscussionDiscoveryIntelPanel />
    </div>
  );
}
