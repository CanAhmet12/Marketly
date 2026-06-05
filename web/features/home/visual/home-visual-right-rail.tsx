"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import type { HomeVisualRailLink } from "./mock-data";
import { RailCreatorFollow } from "./rail-creator-follow";

type SectionProps = { title: string; children: ReactNode; action?: ReactNode };

function Section({ title, children, action }: SectionProps) {
  return (
    <section className="hv-ref-rail__section hv-ref-rail__section--soft" aria-label={title}>
      <div className="hv-ref-rail__section-head">
        <h3 className="hv-ref-rail__h">{title}</h3>
        {action ? <div className="hv-ref-rail__section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function TodayCue({ tone }: { tone?: HomeVisualRailLink["tone"] }) {
  const t = tone ?? "flat";
  if (t === "up") {
    return (
      <span className="hv-ref-rail__cue hv-ref-rail__cue--up" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19V6M12 6l-5 5M12 6l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (t === "down") {
    return (
      <span className="hv-ref-rail__cue hv-ref-rail__cue--down" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v13M12 18l5-5M12 18l-5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="hv-ref-rail__cue hv-ref-rail__cue--flat" aria-hidden>
      <span className="hv-ref-rail__cue-dot" />
    </span>
  );
}

/** Piyasa kısayolları — 2 sütun editorial satırlar (tile yok) */
function ShortcutEditorial({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <ul className="hv-ref-rail__sc-rows" role="list">
      {items.map((item) => {
        const accent = item.accent === "up" ? "up" : item.accent === "down" ? "down" : "flat";
        return (
          <li key={item.label} className="hv-ref-rail__sc-row" role="listitem">
            <span className="hv-ref-rail__sc-dot" data-accent={accent} aria-hidden />
            <span className="hv-ref-rail__sc-lab">{item.label}</span>
            {item.meta ? (
              <span className="hv-ref-rail__sc-pct" data-accent={accent}>
                {item.meta}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function TodayFeed({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <div className="hv-ref-rail__today-stack">
      {items.map((item) => (
        <div key={item.label} className="hv-ref-rail__event">
          <div className="hv-ref-rail__event-row">
            <TodayCue tone={item.tone} />
            <div className="hv-ref-rail__event-main">
              <div className="hv-ref-rail__event-line1">
                <span className="hv-ref-rail__event-title">{item.label}</span>
                {item.meta ? <span className="hv-ref-rail__event-time">{item.meta}</span> : null}
              </div>
              {item.detail ? <p className="hv-ref-rail__event-detail">{item.detail}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InterestInline({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <p className="hv-ref-rail__interest-flow">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 ? <span className="hv-ref-rail__interest-sep" aria-hidden>
              {" · "}
            </span> : null}
          <span className="hv-ref-rail__interest" data-strength={item.chipStrength ?? "mid"}>
            {item.label}
            {item.meta ? <span className="hv-ref-rail__interest-meta">{item.meta}</span> : null}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

function TrendingRows({ items }: { items: HomeVisualRailLink[] }) {
  return (
    <ol className="hv-ref-rail__trend-list">
      {items.map((item) => {
        const da =
          item.trendDeltaAccent === "up"
            ? "up"
            : item.trendDeltaAccent === "down"
              ? "down"
              : undefined;
        return (
          <li key={item.label} className="hv-ref-rail__trend-row">
            <span className="hv-ref-rail__trend-rank">{item.rank != null ? item.rank : "—"}</span>
            <div className="hv-ref-rail__trend-body">
              <span className="hv-ref-rail__trend-tag">{item.label}</span>
            </div>
            <div className="hv-ref-rail__trend-metrics">
              {item.meta ? <span className="hv-ref-rail__trend-views">{item.meta}</span> : null}
              {item.trendDelta ? (
                <span className="hv-ref-rail__trend-delta" data-accent={da}>
                  {item.trendDelta}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CreatorRows({ items, viewerId }: { items: HomeVisualRailLink[]; viewerId: string | null }) {
  return (
    <div className="hv-ref-rail__creators">
      {items.map((item) => (
        <div key={item.creatorUserId ?? item.label} className="hv-ref-rail__creator">
          <div className="hv-ref-rail__creator-avatar">
            {item.avatarUrl ? (
              <Image
                src={item.avatarUrl}
                alt=""
                width={36}
                height={36}
                sizes="36px"
                className="hv-ref-rail__creator-img"
              />
            ) : (
              <span className="hv-ref-rail__creator-placeholder" aria-hidden>
                {item.label.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="hv-ref-rail__creator-text">
            <div className="hv-ref-rail__creator-top">
              {item.creatorUserId ? (
                <Link href={`/channel/${item.creatorUserId}`} className="hv-ref-rail__creator-name hover:opacity-90">
                  {item.label}
                </Link>
              ) : (
                <span className="hv-ref-rail__creator-name">{item.label}</span>
              )}
              {item.meta ? <span className="hv-ref-rail__creator-tier">{item.meta}</span> : null}
            </div>
            {item.handle ? <span className="hv-ref-rail__creator-handle">{item.handle}</span> : null}
          </div>
          {item.creatorUserId ? (
            <RailCreatorFollow creatorUserId={item.creatorUserId} viewerId={viewerId} />
          ) : (
            <Link href="/discover?tab=creators" className="hv-ref-rail__follow">
              Takip Et
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

type Props = {
  shortcuts: HomeVisualRailLink[];
  today: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  trending: HomeVisualRailLink[];
  creators: HomeVisualRailLink[];
  viewerId?: string | null;
};

export function HomeVisualRightRail({ shortcuts, today, interests, trending, creators, viewerId = null }: Props) {
  return (
    <div className={cn("hv-ref-rail", "hv-ref-rail--rich")}>
      {shortcuts.length > 0 ? (
        <Section title="Piyasa kısayolları">
          <ShortcutEditorial items={shortcuts} />
        </Section>
      ) : null}
      {today.length > 0 ? (
        <Section title="Bugün">
          <TodayFeed items={today} />
        </Section>
      ) : null}
      {interests.length > 0 ? (
        <Section
          title="İlgi alanların"
          action={
            <Link href="/settings" className="hv-ref-rail__action-link">
              Düzenle
            </Link>
          }
        >
          <InterestInline items={interests} />
        </Section>
      ) : null}
      {trending.length > 0 ? (
        <Section title="Bugün konuşulanlar">
          <TrendingRows items={trending} />
        </Section>
      ) : null}
      {creators.length > 0 ? (
        <Section title="Sana önerilen creatorlar">
          <CreatorRows items={creators} viewerId={viewerId} />
        </Section>
      ) : null}
    </div>
  );
}
