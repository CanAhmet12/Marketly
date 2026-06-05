/* eslint-disable @next/next/no-img-element -- thumbnail */

import Link from "next/link";

import { EmptyState } from "@/components/states";
import type { RelatedVideo } from "@/features/watch/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { isMockDataEnabled } from "@/mock/config";

import { RelatedVideoThumb } from "./related-video-thumb";
import { WatchAssetPulseStrip } from "./watch-asset-pulse-strip";
import { getPersonalizationRepository } from "@/features/personalization/repository";

type Props = {
  related: RelatedVideo[];
  isLoading: boolean;
  playlistId?: string | null;
  /** Varlık etiketi — sidebar pulse strip */
  assetTag?: string | null;
};

function continuityHint(tag: string): string {
  const map: Record<string, string> = {
    Liste: "Bu listede sırada",
    Üretici: "Aynı üreticiden",
    Varlık: "Aynı varlıkta",
    Format: "Benzer format",
    Oturum: "İzleme oturumun",
    Piyasa: "İlgili piyasa",
    Öneri: "Sana özel",
  };
  return map[tag] ?? tag;
}

function watchHref(id: string, playlistId?: string | null) {
  const base = `/watch/${encodeURIComponent(id)}`;
  return playlistId ? `${base}?list=${encodeURIComponent(playlistId)}` : base;
}

function WatchRelatedFeedback({ postId, creatorId }: { postId: string; creatorId: string }) {
  if (!isMockDataEnabled()) return null;
  return (
    <details className="relative shrink-0 text-[var(--color-meta)]">
      <summary className="cursor-pointer list-none rounded px-1 py-0.5 text-[10px] font-semibold hover:bg-[var(--color-surface-hover)] [&::-webkit-details-marker]:hidden">
        ···
      </summary>
      <div className="absolute right-0 z-10 mt-1 w-44 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-[10px] shadow-[var(--shadow-card)]">
        <p className="mb-1 font-medium text-[var(--color-text-secondary)]">Öneri</p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="rounded bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] py-1 font-semibold text-[var(--color-primary-dark)]"
            onClick={() =>
              getPersonalizationRepository().applyWatchFeedback({ type: "more_watch_like", postId, creatorId })
            }
          >
            Daha çok böyle
          </button>
          <button
            type="button"
            className="rounded border border-[var(--color-border)] py-1 font-semibold text-[var(--color-text-secondary)]"
            onClick={() => getPersonalizationRepository().applyWatchFeedback({ type: "less_watch_like", postId })}
          >
            Daha az
          </button>
          <button
            type="button"
            className="rounded border border-[var(--color-border)] py-1 font-semibold text-[var(--color-text-secondary)]"
            onClick={() => getPersonalizationRepository().applyWatchFeedback({ type: "hide_watch_creator", creatorId })}
          >
            Üreticiyi gizle
          </button>
        </div>
      </div>
    </details>
  );
}

function RelatedSkeleton() {
  return (
    <div className="flex min-w-0 gap-2.5">
      <div className="motion-shimmer h-[78px] w-[132px] max-w-[36%] shrink-0 rounded-[10px] bg-[var(--color-divider)] sm:h-[84px] sm:w-[148px] sm:max-w-none" />
      <div className="min-w-0 flex-1 space-y-2 py-1">
        <div className="motion-shimmer h-3.5 w-full rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-3 w-2/3 rounded bg-[var(--color-divider)]" />
        <div className="motion-shimmer h-3 w-1/2 rounded bg-[var(--color-divider)]" />
      </div>
    </div>
  );
}

export function WatchRelatedSidebar({ related, isLoading, playlistId = null, assetTag = null }: Props) {
  const next = related[0];
  const rest = related.slice(1);

  return (
    <aside className="mt-6 min-w-0 lg:sticky lg:top-[calc(var(--chrome-top-offset,0px)+0.75rem)] lg:mt-0 lg:self-start">
      {assetTag?.trim() ? <WatchAssetPulseStrip assetTag={assetTag} /> : null}
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-meta)]">Sıradaki</h2>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <RelatedSkeleton key={i} />
          ))}
        </div>
      ) : related.length === 0 ? (
        <EmptyState
          title="Benzer video yok"
          description="Şimdilik öneri bulunamadı. Keşfet'ten yeni içerikler bulabilirsin."
          actionLabel="Keşfet"
          actionHref="/discover?tab=videos"
          tone="neutral"
          compact
        />
      ) : (
        <div className="min-w-0 space-y-3">
          {next ? (
            <div className="min-w-0 rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_3%,var(--color-surface))] p-2">
              {next.continuity_tag ? (
                <p className="mb-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                  <span className="text-[var(--color-meta)]">Neden · </span>
                  {continuityHint(next.continuity_tag)}
                </p>
              ) : null}
              <div className="flex min-w-0 gap-1">
                <Link href={watchHref(next.id, playlistId)} className="group flex min-w-0 flex-1 gap-2.5">
                  <RelatedVideoThumb video={next} />
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="line-clamp-2 text-[12px] font-bold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary-dark)]">
                      {next.title?.trim() || next.content?.slice(0, 72) || "Video"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--color-text-secondary)]">{next.creator_name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-[var(--color-meta)]">
                      {next.views_count ? <span>{formatCompactCount(next.views_count)} görüntülenme</span> : null}
                      {next.views_count ? <span>·</span> : null}
                      <span>{formatTimeAgo(next.created_at)}</span>
                    </div>
                  </div>
                </Link>
                {next.creator_id ? <WatchRelatedFeedback postId={next.id} creatorId={next.creator_id} /> : null}
              </div>
            </div>
          ) : null}

          {rest.length ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-meta)]">Devam</p>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {rest.map((r) => (
                  <li key={r.id} className="min-w-0">
                    <div className="flex min-w-0 gap-0.5">
                      <Link
                        href={watchHref(r.id, playlistId)}
                        className="group flex min-w-0 flex-1 gap-2 rounded-[10px] p-1 transition hover:bg-[var(--color-surface-hover)] active:scale-[0.995]"
                      >
                        <RelatedVideoThumb video={r} />
                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex items-start gap-1.5">
                            {r.continuity_tag ? (
                              <span className="mt-0.5 shrink-0 rounded bg-[var(--color-surface-muted)] px-1 py-px text-[8px] font-bold uppercase text-[var(--color-meta)]">
                                {r.continuity_tag}
                              </span>
                            ) : null}
                            <p className="line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-primary-dark)]">
                              {r.title?.trim() || r.content?.slice(0, 64) || "Video"}
                            </p>
                          </div>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-[var(--color-text-secondary)]">{r.creator_name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] text-[var(--color-meta)]">
                            {r.views_count ? <span>{formatCompactCount(r.views_count)} görüntü.</span> : null}
                            {r.views_count ? <span>·</span> : null}
                            <span>{formatTimeAgo(r.created_at)}</span>
                          </div>
                        </div>
                      </Link>
                      {r.creator_id ? <WatchRelatedFeedback postId={r.id} creatorId={r.creator_id} /> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}
    </aside>
  );
}
