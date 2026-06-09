"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type {
  MarketsCommunityNetworkBundle,
  MarketsDiscussionSocialKind,
} from "@/features/markets/types/markets-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  bundle: MarketsCommunityNetworkBundle;
  compact?: boolean;
};

function socialKindLabel(k: MarketsDiscussionSocialKind): string {
  const m: Record<string, string> = {
    tracking: "İzleme",
    thesis_reaction: "Tez",
    conviction_reaction: "Güven",
    follow_discussion: "Takip",
    creator_reply: "Yanıt",
    copied_thesis: "Kopya",
    sentiment: "His",
  };
  return m[k] ?? k;
}

export function MarketsCommunityNetworkPanel({ bundle, compact = false }: Props) {
  const { live, community, crossAssetChains, socialMechanics } = bundle;
  const hasAny =
    live.creatorsDiscussing.length > 0 ||
    community.hottestDebates.length > 0 ||
    crossAssetChains.length > 0 ||
    socialMechanics.length > 0;

  if (!hasAny && community.activeDiscussionCount === 0) {
    return (
      <MarketIntelSection title="Piyasa tartışma ağı" description="Canlı tartışma katmanı bağlandığında dolar." bodyClassName="p-[var(--sp-3)]">
        <p className="text-[12px] font-medium text-[var(--color-meta)]">Şu an tartışma özeti yok.</p>
      </MarketIntelSection>
    );
  }

  return (
    <MarketIntelSection
      title="Piyasa tartışma ağı"
      description="Canlı oda hissi, çapraz varlık zincirleri ve pazar-sosyal ipuçları — repository."
      headerAside={
        <Link href="/signals" className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Sinyaller
        </Link>
      }
      bodyClassName="p-[var(--sp-3)]"
    >
      <div className={cn("grid min-w-0 gap-[var(--sp-3)]", compact ? "" : "min-[900px]:grid-cols-2")}>
        <div className="min-w-0 space-y-[var(--sp-2)] rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] p-[var(--sp-3)]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Canlı seans</p>
          <p className="text-[12px] font-semibold text-[var(--color-text)]">{live.activeNowLabel}</p>
          <div className="flex flex-wrap gap-x-[var(--sp-2)] gap-y-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
            <span>{live.activeRoomsCount} oda</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>{live.fastMovingThreadCount} hızlı başlık</span>
            <span className="text-[var(--color-border)]">·</span>
            <span className="min-w-0 truncate">{live.sentimentShiftLabel}</span>
          </div>
          <p className="text-[11px] text-[var(--color-meta)]">{live.macroFocusLabel}</p>
          {live.creatorsDiscussing.length ? (
            <ul className="mt-1 space-y-1">
              {live.creatorsDiscussing.map((c) => (
                <li key={c.href + c.assetSymbol} className="flex flex-wrap items-center gap-x-2 text-[11px]">
                  <Link href={c.href} className="font-bold text-[var(--color-text)] hover:underline">
                    {c.display}
                  </Link>
                  <Link href={`/markets/${encodeURIComponent(c.assetSymbol)}`} className="text-[var(--color-primary-dark)] hover:underline">
                    {c.assetSymbol}
                  </Link>
                  {c.live ? (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] px-1.5 py-px text-[11px] font-bold uppercase text-[var(--color-primary-dark)]">
                      canlı
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {live.breakingThemes.length ? (
            <div className="mt-[var(--sp-2)] flex flex-wrap gap-1">
              {live.breakingThemes.map((t) => (
                <span key={t} className="rounded-md border border-[color-mix(in_srgb,var(--color-border)_75%,transparent)] px-1.5 py-px text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 space-y-[var(--sp-2)] rounded-[12px] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] p-[var(--sp-3)]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Topluluk istihbaratı</p>
          <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">
            {community.discussionMomentumLabel} · yoğunluk %{community.participationDensityPct}
          </p>
          <p className="text-[11px] text-[var(--color-meta)]">{community.analystVsCommunitySplitLabel}</p>
          <p className="text-[11px] font-semibold uppercase text-[var(--color-meta)]">Sıcak tartışmalar</p>
          <ul className="space-y-1">
            {community.hottestDebates.length === 0 ? (
              <li className="text-[11px] text-[var(--color-meta)]">—</li>
            ) : (
              community.hottestDebates.map((d) => (
                <li key={d.symbol} className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <Link href={d.href} className="min-w-0 truncate font-bold text-[var(--color-text)] hover:underline">
                    {d.symbol}
                  </Link>
                  <span className="shrink-0 text-[var(--color-meta)]">{d.stanceSplitLabel}</span>
                </li>
              ))
            )}
          </ul>
          <p className="text-[11px] font-semibold uppercase text-[var(--color-meta)]">Çapraz akış</p>
          <ul className="space-y-1">
            {crossAssetChains.length === 0 ? (
              <li className="text-[11px] text-[var(--color-meta)]">—</li>
            ) : (
              crossAssetChains.map((c) => (
                <li key={c.id} className="text-[11px]">
                  <Link href={c.href} className="font-semibold text-[var(--color-text)] hover:underline">
                    {c.leftSymbol} ↔ {c.rightSymbol}
                  </Link>
                  <span className="text-[var(--color-meta)]"> · {c.theme}</span>
                  <span className="text-[var(--color-border)]"> · </span>
                  <span className="text-[var(--color-text-secondary)]">{c.intensityLabel}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {!compact && socialMechanics.length ? (
        <div className="mt-[var(--sp-3)] border-t border-[color-mix(in_srgb,var(--color-border)_70%,transparent)] pt-[var(--sp-3)]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Pazar-sosyal sinyal</p>
          <ul className="mt-[var(--sp-2)] grid gap-2 min-[640px]:grid-cols-2">
            {socialMechanics.map((s) => (
              <li key={s.id} className="min-w-0 rounded-lg border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] px-[var(--sp-2)] py-[var(--sp-2)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-1 py-px text-[11px] font-bold uppercase text-[var(--color-meta)]">
                    {socialKindLabel(s.kind)}
                  </span>
                  {s.symbol ? (
                    <Link href={`/markets/${encodeURIComponent(s.symbol)}`} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
                      {s.symbol}
                    </Link>
                  ) : null}
                </div>
                <Link href={s.href} className="mt-1 block text-[12px] font-semibold text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                  {s.headline}
                </Link>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </MarketIntelSection>
  );
}
