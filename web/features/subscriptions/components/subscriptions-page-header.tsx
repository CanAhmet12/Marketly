"use client";

import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = {
  title?: string;
  subtitle?: string;
};

export function SubscriptionsPageHeader({ title = "Üyelikler", subtitle }: Props) {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("connect", "Üyelikler")}
      title={title}
      subtitle={subtitle}
    />
  );
}
