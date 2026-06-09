"use client";

import { HubButton } from "@/features/hub/components/hub-button";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";

type Props = {
  mockOn?: boolean;
  onResetDemo?: () => void;
};

export function SettingsPageHeader({ mockOn, onResetDemo }: Props) {
  return (
    <HubPageHeader
      kicker={hubPremiumKicker("tools", "Ayarlar")}
      title="Ayarlar"
      actions={
        mockOn && onResetDemo ? (
          <HubButton type="button" onClick={onResetDemo}>
            Demo sıfırla
          </HubButton>
        ) : undefined
      }
    />
  );
}
