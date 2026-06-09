"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, memo, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { EmptyState } from "@/components/states";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { useAuth } from "@/features/auth/use-auth";
import { HubButton } from "@/features/hub/components/hub-button";
import { HubHeroStrip } from "@/features/hub/components/hub-hero-strip";
import { HubPageHeader } from "@/features/hub/components/hub-page-header";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { hubPremiumKicker } from "@/features/hub/lib/hub-premium-zone";
import { useNotificationCenter } from "@/features/notifications/hooks/use-notification-center";
import { formatNotificationGroupLabel } from "@/features/notifications/domain/notification-priority";
import { recordNotificationOpened } from "@/features/notifications/domain/notification-action-store";
import type { NotificationCenterAction, NotificationCenterItem, NotificationInboxStreamId } from "@/features/notifications/domain/types";
import { trackContentView } from "@/features/personalization/tracking";
import { NotificationsPageSkeleton } from "@/features/social/components/social-states";
import { effectiveReadAt } from "@/features/social/hooks/use-notification-inbox";
import { notificationStreamToParam, resolveNotificationStream } from "@/features/social/lib/inbox-stream-params";
import { formatSocialRelativeTime, getNotificationKindLabel } from "@/features/social/lib/social-format";
import type { MockNotificationType } from "@/features/social/types";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

const STREAMS: { id: NotificationInboxStreamId; label: string }[] = [
  { id: "today", label: "Bugün" },
  { id: "important", label: "Önemli" },
  { id: "portfolio", label: "Portföyün" },
  { id: "following", label: "Takip ettiklerin" },
  { id: "premium", label: "Premium" },
  { id: "discussions", label: "Tartışmalar" },
  { id: "all", label: "Tümü" },
];

function partitionBatches(items: NotificationCenterItem[]) {
  type Block =
    | { kind: "batch"; key: string; items: NotificationCenterItem[] }
    | { kind: "single"; item: NotificationCenterItem };
  const out: Block[] = [];
  let i = 0;
  while (i < items.length) {
    const it = items[i]!;
    const bk = it.batch_key;
    if (bk) {
      const group = [it];
      let j = i + 1;
      while (j < items.length && items[j]!.batch_key === bk) {
        group.push(items[j]!);
        j++;
      }
      if (group.length > 1) out.push({ kind: "batch", key: bk, items: group });
      else out.push({ kind: "single", item: it });
      i = j;
    } else {
      out.push({ kind: "single", item: it });
      i++;
    }
  }
  return out;
}

function TypeDot({ type }: { type: MockNotificationType }) {
  const premium: MockNotificationType[] = [
    "premium_signal",
    "signal_lifecycle",
    "target_stop",
    "subscription_update",
    "premium_unlock",
    "signal_copied",
  ];
  const market: MockNotificationType[] = [
    "price_alert",
    "market_move",
    "macro_alert",
    "watchlist_intel",
    "portfolio_intel",
    "strategy_fit",
    "rising_theme",
  ];
  const cls = premium.includes(type)
    ? "bg-[color-mix(in_srgb,var(--color-primary-dark)_72%,var(--color-meta))]"
    : market.includes(type)
      ? "bg-[color-mix(in_srgb,var(--color-text)_35%,var(--color-meta))]"
      : "bg-[color-mix(in_srgb,var(--color-primary)_40%,var(--color-meta))]";
  return <span className={cn("pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--color-surface)]", cls)} aria-hidden />;
}

export function NotificationsPageClient() {
  const mockOn = isMockDataEnabled();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const streamTabRefs = useRef<Partial<Record<NotificationInboxStreamId, HTMLButtonElement | null>>>({});
  const uid = user?.id;

  const stream = useMemo(() => resolveNotificationStream(searchParams.get("stream")), [searchParams]);

  const pushStream = useCallback(
    (id: NotificationInboxStreamId) => {
      const sp = new URLSearchParams(searchParams.toString());
      const param = notificationStreamToParam(id);
      if (param) sp.set("stream", param);
      else sp.delete("stream");
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { hub, visibleItems, dispatch, inbox } = useNotificationCenter(uid, stream);
  const { unreadCount, markRead, markAllRead, overrides, hydrated } = inbox;

  const onStreamKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, current: NotificationInboxStreamId) => {
      const order = STREAMS.map((s) => s.id);
      const idx = order.indexOf(current);
      if (idx < 0) return;
      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % order.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + order.length) % order.length;
      else return;
      e.preventDefault();
      const next = order[nextIdx]!;
      streamTabRefs.current[next]?.focus();
      pushStream(next);
    },
    [pushStream],
  );

  const blocks = useMemo(() => partitionBatches(visibleItems), [visibleItems]);

  const loginNext = pathname?.startsWith("/hub") ? pathname : "/hub/notifications";

  const pageHeader = (
    <HubPageHeader
      kicker={hubPremiumKicker("inbox", "Bildirimler")}
      title={user ? hub.headline : "Bildirim merkezi"}
      subtitle={user ? hub.subline : "Portföy, takip ve premium akışlarından gelen olaylar burada toplanır."}
      actions={
        user ? (
          <HubButton
            type="button"
            disabled={!hydrated || unreadCount === 0}
            onClick={() => markAllRead()}
          >
            Tümünü oku
          </HubButton>
        ) : undefined
      }
    />
  );

  const heroStrip =
    user && hydrated ? (
      <HubHeroStrip
        stats={[
          {
            label: "Okunmamış",
            value: unreadCount,
            valueAccent: unreadCount > 0,
          },
          {
            label: "Güven",
            value: hub.confidence_label,
          },
        ]}
      />
    ) : null;

  useEffect(() => {
    if (!hydrated) return;
    trackContentView({ contentFormat: "post", surface: "notifications_inbox_v2" });
  }, [hydrated]);

  const empty = visibleItems.length === 0;

  if (!isInitialized) {
    return (
      <HubPageShell zone="inbox" className="notif-page" header={pageHeader}>
        <NotificationsPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="inbox" className="notif-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Bildirim merkezi"
          description="Bildirimlerinizi görmek için oturum açın."
          actionLabel="Oturum aç"
          actionHref={`/auth/login?next=${encodeURIComponent(loginNext)}`}
          tone="social"
          compact
        />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="inbox" className="notif-page" header={pageHeader} hero={heroStrip}>
      <div className="min-w-0 max-w-full overflow-x-hidden">
      {hub.adaptive_subline ? <p className="text-[11px] font-medium text-[var(--color-meta)]">{hub.adaptive_subline}</p> : null}
      {hub.fatigue_note ? <p className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">{hub.fatigue_note}</p> : null}

      {hub.nav_links.length ? (
        <div className="flex flex-wrap gap-1">
          {hub.nav_links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="notif-nav-link rounded-full border px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}

      {hub.digests.length ? (
        <div className="ms-scrollbar-thin flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hub.digests.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="notif-digest-link min-w-[9.5rem] max-w-[11rem] shrink-0 rounded-[var(--radius-md)] border px-[var(--sp-3)] py-2 shadow-[var(--shadow-card)] transition"
            >
              <p className="text-[11px] font-bold uppercase text-[var(--color-meta)]">{d.title}</p>
              <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--color-text)]">{d.subline}</p>
            </Link>
          ))}
        </div>
      ) : null}

      <div
        className="ms-scrollbar-thin flex min-w-0 gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ms-rail-scroll"
        role="tablist"
        aria-label="Bildirim akışı"
      >
        {STREAMS.map((s) => {
          const on = stream === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              ref={(el) => { streamTabRefs.current[s.id] = el; }}
              onClick={() => pushStream(s.id)}
              onKeyDown={(e) => onStreamKeyDown(e, s.id)}
              className={cn(
                "notif-stream-tab shrink-0 rounded-full px-[var(--sp-3)] py-1.5 text-[11px] font-bold transition",
                on ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {empty ? (
        <div>
          <EmptyState
            title={!mockOn ? "Henüz olay yok" : "Bu akışta sonuç yok"}
            description={
              !mockOn
                ? "Canlı modda olaylar yüklendiğinde zekâ kutusu güncellenir. Portföy ve liste bağlantılarını tamamlayın."
                : stream !== "today" && stream !== "all"
                  ? "Başka bir akış seçin veya tüm bildirimlere geçin."
                  : "Başka bir akış seçin veya sessize alınan içerikçileri ayarlardan gözden geçirin."
            }
            actionLabel={stream !== "today" && stream !== "all" ? "Tümünü göster" : undefined}
            onAction={stream !== "today" && stream !== "all" ? () => pushStream("all") : undefined}
            tone="social"
            compact
          />
        </div>
      ) : (
        <div className="min-w-0 space-y-[var(--sp-3)]">
          {blocks.map((b, bi) =>
            b.kind === "batch" ? (
              <section
                key={`batch-${b.key}-${bi}`}
                className="notif-batch-card rounded-[14px] border bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
              >
                <h2 className="notif-batch-head border-b px-[var(--sp-3)] py-2 uppercase tracking-[0.12em]">
                  {formatNotificationGroupLabel(b.items)}
                </h2>
                <ul className="m-0 list-none p-0">
                  {b.items.map((it) => (
                    <NotificationRow key={it.id} item={it} overrides={overrides} markRead={markRead} dispatch={dispatch} />
                  ))}
                </ul>
              </section>
            ) : (
              <div key={b.item.id} className="notif-single-card rounded-[14px] border bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
                <ul className="m-0 list-none p-0">
                  <NotificationRow item={b.item} overrides={overrides} markRead={markRead} dispatch={dispatch} />
                </ul>
              </div>
            ),
          )}
        </div>
      )}
      </div>
    </HubPageShell>
  );
}

const NotificationRow = memo(function NotificationRow({
  item,
  overrides,
  markRead,
  dispatch,
}: {
  item: NotificationCenterItem;
  overrides: Record<string, string>;
  markRead: (id: string) => void;
  dispatch: (a: NotificationCenterAction) => void;
}) {
  const n = item.row;
  const read = Boolean(effectiveReadAt(n, overrides));

  return (
    <li className="border-b border-[color-mix(in_srgb,var(--color-border)_45%,transparent)] last:border-0">
      <div
        className={cn(
          "flex min-w-0 gap-[var(--sp-2)] px-[var(--sp-2)] py-[var(--sp-2)] transition-colors hover:bg-[var(--color-surface-hover)] min-[480px]:gap-[var(--sp-3)] min-[480px]:px-[var(--sp-3)]",
          !read && "notif-unread-row bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]",
          item.importance === "critical" && !read && "bg-[color-mix(in_srgb,var(--color-text)_5%,var(--color-surface))]",
        )}
      >
        <div
          className={cn(
            "hidden w-[3px] shrink-0 self-stretch rounded-full sm:block",
            read ? "bg-transparent" : "notif-unread-bar bg-[color-mix(in_srgb,var(--color-primary)_45%,var(--color-meta))]",
          )}
          aria-hidden
        />
        <Link href={item.actor_href} onClick={(e) => e.stopPropagation()} className="relative shrink-0 self-start" aria-label={`${n.actor_display} profili`}>
          {n.actor_avatar_url ? (
            <SafeAvatar src={n.actor_avatar_url} alt="" size={40} className="h-10 w-10 ring-1 ring-[color-mix(in_srgb,var(--color-border)_70%,transparent)]" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] text-[13px] font-bold text-[var(--color-text)] ring-1 ring-[color-mix(in_srgb,var(--color-border)_70%,transparent)]">
              {n.actor_display.slice(0, 1).toUpperCase()}
            </div>
          )}
          <TypeDot type={n.type as MockNotificationType} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-meta)]">{getNotificationKindLabel(n.type as MockNotificationType)}</span>
              {item.starred ? <span className="text-[11px] font-bold text-[var(--color-primary-dark)]">Önemli</span> : null}
              {item.importance === "critical" ? (
                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--color-text)]">Kritik</span>
              ) : null}
              {!read ? <span className="notif-unread-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" title="Okunmadı" aria-label="Okunmadı" /> : null}
            </div>
            <time className="shrink-0 text-[11px] font-semibold tabular-nums text-[var(--color-meta)]" dateTime={n.created_at}>
              {formatSocialRelativeTime(n.created_at)}
            </time>
          </div>
          <p className="mt-0.5 truncate text-[14px] font-bold leading-snug text-[var(--color-text)]">{n.title}</p>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)] [overflow-wrap:anywhere]">{n.body}</p>
          {item.relevance_line ? <p className="mt-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">{item.relevance_line}</p> : null}
          <p className="mt-1 text-[11px] font-semibold text-[var(--color-meta)]">
            <Link href={item.actor_href} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary-dark)] hover:underline">
              {n.actor_display}
            </Link>
            {n.actor_verified ? <span className="text-[var(--color-meta)]"> · onaylı</span> : null}
          </p>
          <div className="mt-[var(--sp-2)] flex flex-wrap gap-1">
            {item.actions.map((a) => (
              <ActionChip key={a.id} action={a} n={n} markRead={markRead} dispatch={dispatch} />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
});

function ActionChip({
  action,
  n,
  markRead,
  dispatch,
}: {
  action: NotificationCenterItem["actions"][number];
  n: NotificationCenterItem["row"];
  markRead: (id: string) => void;
  dispatch: (a: NotificationCenterAction) => void;
}) {
  if (action.kind === "open_primary" && action.href) {
    return (
      <Link
        href={action.href}
        onClick={() => {
          recordNotificationOpened(n.type);
          markRead(n.id);
        }}
        className="notif-action-primary rounded-full px-2.5 py-1 text-[11px] font-bold hover:underline"
      >
        {action.label}
      </Link>
    );
  }
  if (action.kind === "open_secondary" && action.href) {
    return (
      <Link
        href={action.href}
        onClick={() => markRead(n.id)}
        className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
      >
        {action.label}
      </Link>
    );
  }
  if (action.kind === "join_room" && action.href) {
    return (
      <Link href={action.href} onClick={() => markRead(n.id)} className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary-dark)] hover:underline">
        {action.label}
      </Link>
    );
  }
  if (action.kind === "mark_read") {
    return (
      <button
        type="button"
        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline"
        onClick={() => {
          markRead(n.id);
        }}
      >
        {action.label}
      </button>
    );
  }
  if (action.kind === "toggle_star") {
    return (
      <button
        type="button"
        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline"
        onClick={() => dispatch({ type: "toggle_star", notificationId: n.id })}
      >
        {action.label}
      </button>
    );
  }
  if (action.kind === "mute_creator" && action.payload?.creatorId) {
    const id = action.payload.creatorId;
    return (
      <button type="button" className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline" onClick={() => dispatch({ type: "mute_creator", creatorId: id })}>
        {action.label}
      </button>
    );
  }
  if (action.kind === "mute_asset" && action.payload?.symbol) {
    const sym = action.payload.symbol;
    return (
      <button type="button" className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline" onClick={() => dispatch({ type: "mute_asset", symbol: sym })}>
        {action.label}
      </button>
    );
  }
  if (action.kind === "mute_topic" && action.payload?.token) {
    const tok = action.payload.token;
    return (
      <button type="button" className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline" onClick={() => dispatch({ type: "mute_topic", token: tok })}>
        {action.label}
      </button>
    );
  }
  if (action.kind === "follow_creator" && action.payload?.creatorId) {
    const cid = action.payload.creatorId;
    return (
      <button type="button" className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline" onClick={() => dispatch({ type: "follow_creator", creatorId: cid })}>
        {action.label}
      </button>
    );
  }
  if (action.kind === "copy_signal" && action.payload?.text) {
    const text = action.payload.text;
    return (
      <button
        type="button"
        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:underline"
        onClick={() => void navigator.clipboard?.writeText(text)}
      >
        {action.label}
      </button>
    );
  }
  return null;
}
