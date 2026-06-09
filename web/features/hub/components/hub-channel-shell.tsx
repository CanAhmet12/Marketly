import type { ReactNode } from "react";

import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { cn } from "@/lib/cn";

type Props = {
  embeddedInHub?: boolean;
  zone: string;
  className?: string;
  children: ReactNode;
};

/** Hub içinde kanal sayfası — premium zone kabuğu */
export function HubChannelShell({ embeddedInHub, zone, className, children }: Props) {
  if (!embeddedInHub) {
    return (
      <div className={className} data-channel-zone={zone}>
        {children}
      </div>
    );
  }

  return (
    <HubPageShell zone="profile" withMainArea={false} className="hp-canvas--embedded-channel">
      <div className={cn(className)} data-channel-zone={zone}>
        {children}
      </div>
    </HubPageShell>
  );
}
