"use client";

import Link from "next/link";

import { EmptyState } from "@/components/states";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { MarketIntelSection } from "@/features/markets/components/market-intel-section";
import type { AssetDiscussionItem } from "@/features/markets/types/asset-intelligence";
import { cn } from "@/lib/cn";

type Props = { items: AssetDiscussionItem[]; symbol: string };

export function AssetDetailDiscussions({ items, symbol }: Props) {
  const headerAside = (
    <Link href={`/results?q=${encodeURIComponent(symbol)}`} className="text-[12px] font-bold text-[var(--color-primary-dark)] hover:underline">
      Tümünü gör
    </Link>
  );

  return (
    <MarketIntelSection
      title="Creator & tartışma"
      description={`${symbol} etrafında metin akışı — tez omurgası ile birlikte okunur.`}
      headerAside={headerAside}
      bodyClassName="px-0 pb-0 pt-0"
    >
      {items.length === 0 ? (
        <div className="px-[var(--sp-3)] py-[var(--sp-3)]">
          <EmptyState title="Tartışma yok" description="Bu sembol için akış verisi bağlandığında satırlar görünür." tone="market" compact />
        </div>
      ) : (
        <ul className="m-0 divide-y divide-[color-mix(in_srgb,var(--color-border)_80%,transparent)] p-0">
          {items.map((d) => (
            <li key={d.id} className="px-[var(--sp-3)] py-[var(--sp-3)]">
              <div className={cn("flex gap-[var(--sp-3)] border-l-2 pl-[var(--sp-2)]", sentimentBorder(d.sentiment))}>
                <div className="shrink-0">
                  {d.avatarUrl ? (
                    <SafeAvatar src={d.avatarUrl} alt={d.creatorDisplay} size={40} />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[14px] font-bold text-[var(--color-text)]">
                      {d.creatorDisplay.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {d.kind ? (
                      <span className="rounded-md bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-1 py-px text-[9px] font-bold uppercase text-[var(--color-primary-dark)]">
                        {kindLabel(d.kind)}
                      </span>
                    ) : null}
                    {d.live ? (
                      <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-1 py-px text-[9px] font-bold uppercase text-[var(--color-meta)]">
                        canlı
                      </span>
                    ) : null}
                    {d.creatorReplied ? (
                      <span className="text-[9px] font-bold uppercase text-[var(--color-primary-dark)]">yanıt</span>
                    ) : null}
                    <Link href={`/channel/${d.creatorId}`} className="text-[14px] font-bold text-[var(--color-text)] hover:text-[var(--color-primary-dark)] hover:underline">
                      {d.creatorDisplay}
                    </Link>
                    <span className="text-[12px] font-medium text-[var(--color-meta)]">@{d.creatorUsername}</span>
                    {d.verified ? <span className="text-[10px] font-bold uppercase text-[var(--color-primary-dark)]">Onaylı</span> : null}
                    <span className="text-[11px] font-semibold text-[var(--color-meta)]">
                      {new Date(d.createdAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {d.threadTitle ? <p className="mt-1 w-full text-[12px] font-semibold text-[var(--color-text-secondary)]">{d.threadTitle}</p> : null}
                  <p className="mt-[var(--sp-2)] text-[13px] font-medium leading-relaxed text-[var(--color-text)]">{d.content}</p>
                  <div className="mt-[var(--sp-2)] flex flex-wrap items-center gap-x-[var(--sp-2)] gap-y-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    {d.tags.map((t) => (
                      <span key={t} className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-1.5 py-0.5">
                        #{t}
                      </span>
                    ))}
                    {d.trackingCount != null ? (
                      <>
                        <span className="text-[var(--color-border)]">·</span>
                        <span>{d.trackingCount} izleme</span>
                      </>
                    ) : null}
                    <span className="text-[var(--color-border)]">·</span>
                    <span>{d.likes} beğeni</span>
                    <span className="text-[var(--color-border)]">·</span>
                    <span>{d.replies} yanıt</span>
                    <span className="text-[var(--color-border)]">·</span>
                    <span className={cn("text-[11px] font-semibold", sentimentText(d.sentiment))}>{sentimentLabel(d.sentiment)}</span>
                    <Link href={d.href} className="ml-auto text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
                      Gönderiye git →
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </MarketIntelSection>
  );
}

function sentimentBorder(s: AssetDiscussionItem["sentiment"]) {
  if (s === "bullish") return "border-[color-mix(in_srgb,var(--color-rise)_55%,var(--color-border))]";
  if (s === "bearish") return "border-[color-mix(in_srgb,var(--color-fall)_55%,var(--color-border))]";
  return "border-[color-mix(in_srgb,var(--color-border)_95%,transparent)]";
}

function sentimentText(s: AssetDiscussionItem["sentiment"]) {
  if (s === "bullish") return "text-[color-mix(in_srgb,var(--color-rise)_88%,var(--color-text)_12%)]";
  if (s === "bearish") return "text-[color-mix(in_srgb,var(--color-fall)_88%,var(--color-text)_12%)]";
  return "text-[var(--color-meta)]";
}

function sentimentLabel(s: AssetDiscussionItem["sentiment"]) {
  if (s === "bullish") return "Boğa tonu";
  if (s === "bearish") return "Ayı tonu";
  return "Nötr";
}

function kindLabel(k: NonNullable<AssetDiscussionItem["kind"]>) {
  const m: Record<NonNullable<AssetDiscussionItem["kind"]>, string> = {
    thesis: "Tez",
    update: "Güncelleme",
    debate: "Tartışma",
    macro: "Makro",
    signal_followup: "Sinyal",
    quote: "Alıntı",
    cross_asset: "Çapraz",
  };
  return m[k] ?? k;
}
