"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { HubSidebar } from "@/features/hub/components/hub-sidebar";
import { HubMobileNav } from "@/features/hub/components/hub-mobile-nav";
import { resolveHubZone } from "@/features/hub/lib/hub-zone";
import { cn } from "@/lib/cn";

export function HubLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const zone = resolveHubZone(pathname);
  const isProfileView = pathname.startsWith("/hub/profile");
  const isInboxView = pathname.startsWith("/hub/messages");
  const isStudioView = pathname.startsWith("/hub/studio") || pathname.startsWith("/hub/upload");

  return (
    <div
      className={cn(
        "hb-shell hb-shell--immersive",
        isProfileView && "hb-shell--profile-view",
        isInboxView && "hb-shell--inbox-view",
        isStudioView && "hb-shell--studio-view",
      )}
      data-hub-zone={zone}
    >
      <div className="hb-body">
        <HubSidebar />

        <div className="hb-main-stack">
          <main className="hb-main">
            <HubMobileNav />
            <div className="hb-page">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
