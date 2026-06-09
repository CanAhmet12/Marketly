import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioContentClient } from "@/features/studio/studio-content-client";

export const metadata: Metadata = {
  title: "İçerik",
  description: "Yayınlanmış içerik kütüphanesi ve yönetimi.",
};

export default function HubStudioContentPage() {
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioContentClient />
    </Suspense>
  );
}
