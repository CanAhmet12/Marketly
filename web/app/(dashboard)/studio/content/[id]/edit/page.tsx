import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { StudioPageSkeleton } from "@/features/studio/components/studio-states";
import { StudioContentEditClient } from "@/features/studio/studio-content-edit-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `İçerik düzenle — ${id}`,
    description: "Studio içerik başlığı, önizleme ve görünürlük düzenleme.",
  };
}

export default async function StudioContentEditPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <StudioPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <StudioContentEditClient contentId={id} />
    </Suspense>
  );
}
