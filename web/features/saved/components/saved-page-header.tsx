"use client";

import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = { title?: string; subtitle?: string };

export function SavedPageHeader({ title = "Kaydedilenler", subtitle }: Props) {
  return (
    <HubPageHeader kicker={hubPremiumKicker("connect", "Koleksiyon")} title={title} subtitle={subtitle} />
  );
}
