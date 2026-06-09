"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { ChannelPageClient } from "@/features/channel/channel-page-client";
import { ChannelSkeleton } from "@/features/channel/channel-page-parts";
import { HUB_PROFILE_PATH } from "@/features/hub/lib/hub-nav-config";
import { useAuth } from "@/features/auth/use-auth";

/** Kanalım içindeki profil — public kanal UI, hub shell altında */
export function HubProfileClient() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!user?.id) {
      router.replace(`/auth/login?next=${encodeURIComponent(HUB_PROFILE_PATH)}`);
    }
  }, [isInitialized, user?.id, router]);

  if (!isInitialized || !user?.id) {
    return (
      <HubPageShell zone="profile" withMainArea={false} className="hp-canvas--embedded-channel">
        <ChannelSkeleton />
      </HubPageShell>
    );
  }

  return <ChannelPageClient channelUserId={user.id} routeBase={HUB_PROFILE_PATH} embeddedInHub />;
}
