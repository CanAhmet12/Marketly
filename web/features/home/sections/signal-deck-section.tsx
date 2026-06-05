"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { HomeSectionHeader } from "@/features/home/section-header";
import type { HomeSection, SignalDeckRow } from "@/features/home/types";
import {
  SignalConvictionBar,
  SignalDirectionPill,
  SignalLevelsGrid,
  formatSignalPrice,
} from "@/features/signals/components/unified-signal-primitives";

type Props = { section: HomeSection };

export function SignalDeckSection({ section }: Props) {
  return (
    <section className="mt-[var(--sp-6)]" aria-labelledby={`${section.id}-heading`}>
      <HomeSectionHeader title={section.title} subtitle={section.subtitle} seeAllHref={section.seeAllHref} />
      <div className="mb-[var(--sp-2)] flex flex-wrap gap-x-[var(--sp-4)] gap-y-1 text-[12px] font-semibold">
        <Link href="/signals" className="text-[var(--color-primary-dark)] hover:underline">
          Sinyal pazarı
        </Link>
        <span className="text-[var(--color-border)]">·</span>
        <Link href="/discover?tab=signals" className="text-[var(--color-primary-dark)] hover:underline">
          Keşfet · Sinyaller
        </Link>
      </div>
      <div className="-mx-[var(--sp-3)] flex gap-[var(--sp-2)] overflow-x-auto px-[var(--sp-3)] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll">
        {section.items.map((item) =>
          item.kind === "signal_row" ? <SignalDeckCard key={item.row.id} row={item.row} href={item.href} /> : null,
        )}
      </div>
    </section>
  );
}

function SignalDeckCard({ row, href }: { row: SignalDeckRow; href: string }) {
  const router = useRouter();
  const entry = formatSignalPrice(row.entry_price);
  const target = formatSignalPrice(row.target_price);
  const stop = formatSignalPrice(row.stop_loss);

  return (
    <article
      className="ms-card-terminal ms-card-terminal--lift w-[min(320px,86vw)] shrink-0 cursor-pointer overflow-hidden"
      role="button"
      tabIndex={0}
      onClick={() => {
        void router.push(href);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void router.push(href);
        }
      }}
    >
      <div className="p-[var(--sp-3)]">
        <div className="flex items-start justify-between gap-[var(--sp-2)]">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-[var(--color-text)]">{row.symbol}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <SignalDirectionPill direction={row.direction} />
              <span className="text-[11px] font-semibold text-[var(--color-meta)]">{row.timeframe}</span>
            </div>
          </div>
          <div className="w-[100px] shrink-0">
            <SignalConvictionBar confidence={row.confidence} />
          </div>
        </div>
        <div className="mt-[var(--sp-3)]">
          <SignalLevelsGrid entryLabel={entry} targetLabel={target} stopLabel={stop} rrLabel={null} dense />
        </div>
        <p className="mt-[var(--sp-3)] line-clamp-3 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">{row.thesis}</p>
        <div className="mt-[var(--sp-2)] flex items-center gap-[var(--sp-2)]">
          <Link href={`/channel/${row.creator_id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <SafeAvatar src={row.creator_avatar ?? ""} alt="" size={28} className="h-7 w-7 shrink-0 rounded-full ring-1 ring-[color:var(--color-ring-subtle)]" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[var(--color-text)]">{row.creator_name}</p>
            <p className="truncate text-[11px] font-semibold text-[var(--color-muted)]">{row.creator_handle}</p>
          </div>
        </div>
        {row.chart_image_url ? (
          <div className="mt-[var(--sp-2)] overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[color:var(--color-ring-subtle)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.chart_image_url} alt="" className="h-[72px] w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="mt-[var(--sp-2)] rounded-[var(--radius-sm)] bg-[var(--color-thumb-bg)] py-6 text-center text-[11px] font-semibold text-[var(--color-muted)]">
            Grafik önizlemesi
          </div>
        )}
        <p className="mt-[var(--sp-2)] text-center text-[12px] font-semibold text-[var(--color-primary-dark)]">Ayrıntı ve tartışma →</p>
      </div>
    </article>
  );
}
