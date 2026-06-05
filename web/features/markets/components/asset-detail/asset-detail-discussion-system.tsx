"use client";

import Link from "next/link";

import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetDiscussionSystem } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { system: AssetDiscussionSystem; symbol: string };

export function AssetDetailDiscussionSystem({ system, symbol }: Props) {
  const hasThreads = system.thesisThreads.length > 0;
  const hasTimeline = system.timeline.length > 0;

  if (!hasThreads && !hasTimeline) {
    return (
      <MarketIntelSection title="Tez & zaman çizelgesi" description="Tartışma omurgası bağlandığında dolar." bodyClassName="p-[var(--sp-3)]">
        <p className="text-[12px] font-medium text-[var(--color-meta)]">Henüz tez omurgası yok.</p>
      </MarketIntelSection>
    );
  }

  return (
    <MarketIntelSection
      title="Tez & zaman çizelgesi"
      description={`${symbol} etrafında kronolojik tartışma omurgası — tez, makro ve sinyal takibi.`}
      headerAside={
        <Link href={`/signals?asset=${encodeURIComponent(symbol)}`} className="text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
          Sinyal akışı
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="space-y-[var(--sp-3)] px-[var(--sp-3)] py-[var(--sp-3)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Öne çıkan tez</p>
          <p className="mt-1 text-[13px] font-bold text-[var(--color-text)]">{system.trendingThesisTitle}</p>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
            <div className="h-full bg-[color-mix(in_srgb,var(--color-rise)_55%,var(--color-rise))]" style={{ width: `${system.debateBullPct}%` }} />
            <div className="h-full bg-[color-mix(in_srgb,var(--color-fall)_55%,var(--color-fall))]" style={{ width: `${system.debateBearPct}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
            Tez ayrışması · boğa %{system.debateBullPct} · ayı %{system.debateBearPct}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-meta)]">{system.macroInterpretation}</p>
          {system.premiumDiscussionHint ? <p className="mt-1 text-[11px] font-semibold text-[var(--color-primary-dark)]">{system.premiumDiscussionHint}</p> : null}
          <p className="mt-2 text-[12px] leading-snug text-[var(--color-text-secondary)]">{system.crossAssetNarrative}</p>
        </div>

        {hasThreads ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Canlı tez başlıkları</p>
            <ul className="mt-[var(--sp-2)] space-y-2">
              {system.thesisThreads.map((t) => (
                <li key={t.id} className="rounded-lg border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2.5%,var(--color-surface))] p-[var(--sp-2)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={t.href} className="text-[13px] font-bold text-[var(--color-text)] hover:underline">
                      {t.title}
                    </Link>
                    {t.trending ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] px-1.5 py-px text-[9px] font-bold uppercase text-[var(--color-primary-dark)]">
                        trend
                      </span>
                    ) : null}
                    <span className={cn("text-[10px] font-bold uppercase", stanceClass(t.stance))}>{stanceLabel(t.stance)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-meta)]">
                    {t.participantCount} katılımcı · yoğunluk {t.intensity}
                    <span className="text-[var(--color-border)]"> · </span>
                    {new Date(t.lastActivityAt).toLocaleString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasTimeline ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Zaman çizelgesi</p>
            <ul className="mt-[var(--sp-2)] space-y-2">
              {system.timeline.map((e) => (
                <li key={e.id} className="flex gap-[var(--sp-2)] border-l-2 border-[color-mix(in_srgb,var(--color-border)_90%,transparent)] pl-[var(--sp-2)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">{e.label}</p>
                    <Link href={e.href} className="mt-0.5 block text-[12px] font-semibold text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                      {e.detail}
                    </Link>
                    <p className="mt-0.5 text-[10px] text-[var(--color-meta)]">
                      {new Date(e.at).toLocaleString("tr-TR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </MarketIntelSection>
  );
}

function stanceLabel(s: AssetDiscussionSystem["thesisThreads"][0]["stance"]) {
  if (s === "bullish") return "Boğa";
  if (s === "bearish") return "Ayı";
  if (s === "mixed") return "Karışık";
  return "Nötr";
}

function stanceClass(s: AssetDiscussionSystem["thesisThreads"][0]["stance"]) {
  if (s === "bullish") return "text-[color-mix(in_srgb,var(--color-rise)_85%,var(--color-text)_15%)]";
  if (s === "bearish") return "text-[color-mix(in_srgb,var(--color-fall)_85%,var(--color-text)_15%)]";
  return "text-[var(--color-meta)]";
}
