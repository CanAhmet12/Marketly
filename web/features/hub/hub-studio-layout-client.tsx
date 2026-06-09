"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { StudioSubnav } from "@/features/studio/studio-subnav";
import { resolveStudioZone } from "@/features/studio/lib/studio-zone";
import { normalizeStudioPath, STUDIO_HUB_BASE } from "@/features/studio/lib/studio-route-base";

export function HubStudioLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const zone = resolveStudioZone(normalizeStudioPath(pathname));

  return (
    <HubPageShell zone="tools" withMainArea={false} className="hp-canvas--embedded-studio">
      <div className="hb-studio-embed studio-shell" data-studio-zone={zone}>
        <StudioSubnav routeBase={STUDIO_HUB_BASE} />
        <div className="studio-page hb-studio-page">{children}</div>
      </div>
    </HubPageShell>
  );
}
