import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioPlaylistsClient } from "@/features/studio/studio-playlists-client";

export const metadata: Metadata = {
  title: "Oynatma listeleri",
  description: "Oynatma listesi oluşturma ve düzenleme.",
};

export default function StudioPlaylistsPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioPlaylistsClient />
    </Suspense>
  );
}
