"use client";

import { EmptyState } from "@/components/states";
import type { CreatorDirectoryRow } from "@/features/creators/types";
import { CreatorDirectoryCard } from "@/features/creators/components/creator-directory-card";

type Props = {
  creators: CreatorDirectoryRow[];
  title?: string;
  onReset?: () => void;
  isRefining?: boolean;
};

export function CreatorsResultsGrid({ creators, title = "Tüm üreticiler", onReset, isRefining }: Props) {
  if (!creators.length) {
    return (
      <EmptyState
        title="Eşleşen üretici yok"
        description="Filtreleri gevşet, farklı bir varlık seç veya aramayı değiştir."
        tone="creator"
        compact
        actionLabel={onReset ? "Filtreleri temizle" : undefined}
        onAction={onReset}
        secondaryActionLabel="Keşfet'e dön"
        secondaryActionHref="/discover"
      />
    );
  }

  return (
    <section className="creators-page__section" aria-label={title} aria-busy={isRefining}>
      <div className="creators-page__section-head">
        <h2 className="creators-page__section-title">{title}</h2>
        {isRefining ? <p className="creators-page__section-sub">Güncelleniyor…</p> : null}
      </div>
      <ul className="creators-page__grid m-0 list-none p-0">
        {creators.map((c) => (
          <li key={c.id} className="min-w-0">
            <CreatorDirectoryCard creator={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
