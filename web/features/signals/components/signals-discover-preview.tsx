"use client";

import { DiscoverSignalsTabPreview } from "@/features/discover/tab-previews/discover-signals-tab-preview";
import type { VRSignalItem } from "@/features/discover/visual-reference/discover-visual-reference-data";

type Props = {
  items: readonly VRSignalItem[];
};

/** @deprecated Keşfet sinyal önizlemesi — `DiscoverSignalsTabPreview` kullan */
export function SignalsDiscoverPreview({ items }: Props) {
  return <DiscoverSignalsTabPreview items={items} />;
}
