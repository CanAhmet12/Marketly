"use client";

import { memo, useMemo } from "react";

import { SignalsLiveRailCard } from "@/features/signals/components/signals-live-rail-card";
import { mapFeedRowToLiveCardItem } from "@/features/signals/lib/map-feed-row-to-live-card";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type { SignalMarketSectionDef } from "@/features/signals/lib/signal-market-sections";
export { SIGNAL_MARKET_SECTIONS } from "@/features/signals/lib/signal-market-sections";

type Props = {
  row: SignalsFeedRow;
  index?: number;
  onOpen: () => void;
};

function SignalCatalogCardInner({ row, index = 0, onOpen }: Props) {
  const item = useMemo(() => mapFeedRowToLiveCardItem(row), [row]);
  return <SignalsLiveRailCard item={item} index={index} onSelect={onOpen} />;
}

export const SignalCatalogCard = memo(SignalCatalogCardInner);
