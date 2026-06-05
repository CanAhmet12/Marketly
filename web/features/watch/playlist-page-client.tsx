"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { EmptyState } from "@/components/states";
import { PlaylistPageSkeleton } from "@/features/playlists/playlist-page-skeleton";
import { useAuth } from "@/features/auth/use-auth";
import type { PlaylistDetailPayload } from "@/features/playlists/domain/types";
import { getPlaylistRepository } from "@/features/playlists/repository";
import { cn } from "@/lib/cn";
import { formatCompactCount } from "@/lib/format-compact-count";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  playlistId: string;
  playingId?: string | null;
};

function IntelPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,transparent)] px-2 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-meta)]">{label}</p>
      <p className="text-[12px] font-bold tabular-nums text-[var(--color-text)]">%{value}</p>
    </div>
  );
}

function progressLabel(h: PlaylistDetailPayload["member_rows"][0]["progress_hint"]): string | null {
  if (h === "more_signal") return "İlgi sinyali";
  if (h === "started") return "Devam edildi";
  return null;
}

export function PlaylistPageClient({ playlistId, playingId }: Props) {
  const { user, isInitialized } = useAuth();
  const viewerId = user?.id ?? null;
  const viewedRef = useRef<string | null>(null);

  const detail = useMemo(
    () => getPlaylistRepository().getPlaylistDetail(playlistId, viewerId, playingId ?? null),
    [playlistId, viewerId, playingId],
  );

  useEffect(() => {
    if (!detail) return;
    if (viewedRef.current === playlistId) return;
    viewedRef.current = playlistId;
    getPlaylistRepository().recordPlaylistView(playlistId, viewerId);
  }, [detail, playlistId, viewerId]);

  if (!isInitialized) {
    return <PlaylistPageSkeleton />;
  }

  if (!detail) {
    return (
      <div className="ms-page-wrapper ms-container-standard min-w-0 overflow-x-hidden py-[var(--sp-4)]">
        {isMockDataEnabled() ? (
          <EmptyState
            title="Liste bulunamadı"
            description="Bağlantıyı kontrol edin veya Studio’dan yeni bir liste oluşturun."
            actionLabel="Studio"
            actionHref="/studio/playlists"
            tone="creator"
            compact
          />
        ) : (
          <EmptyState
            title="Medya kütüphanesi hazırlanıyor"
            description="Canlı ortamda oynatma listeleri API’ye bağlandığında koleksiyon detayları burada açılacak."
            actionLabel="Keşfet"
            actionHref="/discover?tab=videos"
            tone="neutral"
            compact
          />
        )}
      </div>
    );
  }

  const d = detail;
  const locked = d.access === "locked";

  return (
    <div className="ms-page-wrapper ms-container-standard min-w-0 max-w-full overflow-x-hidden py-[var(--sp-3)] min-[640px]:py-[var(--sp-4)]">
      <section className="relative overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <div className="relative flex flex-col gap-[var(--sp-3)] p-[var(--sp-3)] min-[640px]:flex-row min-[640px]:p-[var(--sp-4)]">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-muted)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_55%,transparent)] min-[640px]:aspect-[16/10] min-[640px]:max-w-[min(52%,420px)]">
            {d.cover_thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.cover_thumbnail_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] font-bold text-[var(--color-meta)]">Kapak yok</div>
            )}
            {locked ? <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-bg)_55%,transparent)] backdrop-blur-[2px]" aria-hidden /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-secondary)]">{d.structure_label}</span>
              <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-meta)]">{d.visibility}</span>
              {locked ? (
                <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-950">Kilitli</span>
              ) : null}
            </div>
            <h1 className="mt-2 text-[clamp(1.1rem,2.6vw,1.35rem)] font-bold leading-tight tracking-tight text-[var(--color-text)]">{d.title}</h1>
            <p className="mt-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{d.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-bold text-[var(--color-meta)]">
              <Link href={d.owner_channel_href} className="text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                {d.owner_display}
              </Link>
              <span className="text-[var(--color-meta)]">·</span>
              <span>{formatCompactCount(d.video_count)} medya</span>
            </div>
            {locked && d.locked_message ? <p className="mt-2 text-[12px] font-medium text-amber-950">{d.locked_message}</p> : null}
            <p className="mt-2 text-[11px] font-medium leading-snug text-[var(--color-meta)]">{d.recommendation_confidence_hint}</p>
            <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">{d.engagement_line}</p>
          </div>
        </div>
      </section>

      {!locked ? (
        <>
          <section className="mt-[var(--sp-3)] rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)] min-[640px]:p-[var(--sp-4)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-meta)]">Tez</p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--color-text)]">{d.intelligence.thesis}</p>
            <p className="mt-2 text-[12px] font-medium italic leading-snug text-[var(--color-text-secondary)]">Üretici niyeti: {d.intelligence.creator_intent}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3 min-[720px]:grid-cols-5">
              <IntelPill label="Momentum" value={d.intelligence.momentum_pct} />
              <IntelPill label="Tartışma yoğunluğu" value={d.intelligence.discussion_density_pct} />
              <IntelPill label="Sinyal örtüşmesi" value={d.intelligence.signal_overlap_pct} />
              <IntelPill label="Piyasa uyumu" value={d.intelligence.market_relevance_pct} />
              <IntelPill label="Strateji hizası" value={d.intelligence.strategy_alignment_pct} />
              <IntelPill label="Üretici sürekliliği" value={d.intelligence.creator_continuity_pct} />
              <IntelPill label="İzleme momentumu" value={d.intelligence.watch_momentum_pct} />
              <IntelPill label="Premium alaka" value={d.intelligence.premium_relevance_pct} />
            </div>
          </section>

          <section className="mt-[var(--sp-3)] rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-[var(--shadow-card)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-meta)]">Süreklilik</p>
            <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">{d.continuation_summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {d.integration_links.map((l) => (
                <Link
                  key={`${l.kind}-${l.href}`}
                  href={l.href}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </section>

          {d.sparse_reason === "no_members" ? (
            <p className="mt-[var(--sp-2)] text-center text-[12px] font-medium text-[var(--color-meta)]">Bu koleksiyonda henüz medya yok.</p>
          ) : null}

          {d.library_hints ? (
            <section className="mt-[var(--sp-3)] rounded-[14px] border border-[color-mix(in_srgb,var(--color-primary)_22%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-surface))] p-[var(--sp-3)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-meta)]">Üretici vitrin</p>
              <ul className="mt-2 space-y-1.5 text-[12px] font-medium text-[var(--color-text-secondary)]">
                <li>· {d.library_hints.positioning_line}</li>
                <li>· {d.library_hints.premium_visibility_line}</li>
                <li>· {d.library_hints.grouping_line}</li>
              </ul>
            </section>
          ) : null}

          <section className="mt-[var(--sp-3)]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-meta)]">Önerilen koleksiyonlar</p>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {d.discovery_rows.map((row) => (
                <Link
                  key={row.id}
                  href={row.href}
                  className="w-[140px] shrink-0 overflow-hidden rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition hover:border-[color-mix(in_srgb,var(--color-text)_18%,var(--color-border))]"
                >
                  <div className="aspect-video w-full bg-[var(--color-surface-muted)]">
                    {row.cover_thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.cover_thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="p-2">
                    {row.badge ? <span className="text-[9px] font-bold uppercase text-[var(--color-meta)]">{row.badge}</span> : null}
                    <p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-snug text-[var(--color-text)]">{row.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-[var(--color-text-secondary)]">{row.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <ol className="mt-[var(--sp-3)] m-0 list-none space-y-1.5 p-0">
            {d.member_rows.map((row) => {
              const active = playingId === row.post_id;
              const ph = progressLabel(row.progress_hint);
              return (
                <li key={row.post_id}>
                  <Link
                    href={row.watch_href}
                    className={cn(
                      "flex min-w-0 gap-2 rounded-[12px] border border-transparent p-2 transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] min-[480px]:gap-3",
                      active && "border-[color-mix(in_srgb,var(--color-primary)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-surface))]",
                    )}
                  >
                    <span className="w-5 shrink-0 pt-1.5 text-center text-[10px] font-bold tabular-nums text-[var(--color-meta)] min-[480px]:w-6 min-[480px]:pt-2">{row.rank}</span>
                    <div className="h-[64px] w-[112px] max-w-[34%] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_60%,transparent)] min-[480px]:h-[72px] min-[480px]:w-[128px]">
                      {row.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[9px] font-bold text-[var(--color-meta)]">{row.type_label}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-0.5 min-[480px]:py-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {row.continuity_label ? (
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-text)]">{row.continuity_label}</span>
                        ) : null}
                        {row.discussion_linked ? (
                          <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-meta)]">Tartışma</span>
                        ) : null}
                        {row.signal_linked ? (
                          <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-meta)]">Sinyal</span>
                        ) : null}
                        {ph ? (
                          <span className="rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-meta)]">{ph}</span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12px] font-bold leading-snug text-[var(--color-text)] min-[480px]:text-[13px]">{row.title}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-[var(--color-text-secondary)] min-[480px]:text-[11px]">
                        {row.type_label}
                        {row.asset_tag ? <span> · {row.asset_tag}</span> : null}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}
    </div>
  );
}
