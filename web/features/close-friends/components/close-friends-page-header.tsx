"use client";

import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = { title?: string; subtitle?: string };

export function CloseFriendsPageHeader({ title = "Yakın Arkadaşlar", subtitle }: Props) {
  return (
    <HubPageHeader kicker={hubPremiumKicker("connect", "Özel daireler")} title={title} subtitle={subtitle} />
  );
}
