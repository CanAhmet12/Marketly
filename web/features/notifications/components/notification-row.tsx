import Link from "next/link";
import { memo, useMemo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { recordNotificationOpened } from "@/features/notifications/domain/notification-action-store";
import type { NotificationCenterAction, NotificationCenterItem } from "@/features/notifications/domain/types";
import { NotificationRowActions } from "@/features/notifications/components/notification-row-actions";
import { effectiveReadAt } from "@/features/social/hooks/use-notification-inbox";
import { formatSocialRelativeTime, getNotificationKindLabel } from "@/features/social/lib/social-format";
import type { MockNotificationType } from "@/features/social/types";
import { cn } from "@/lib/cn";

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
  const tone = premium.includes(type) ? "premium" : market.includes(type) ? "market" : "social";
  return <span className={cn("ntf-type-dot", `ntf-type-dot--${tone}`)} aria-hidden />;
}

function primaryHref(item: NotificationCenterItem): string {
  const primary = item.actions.find((a) => a.kind === "open_primary" && a.href);
  return primary?.href ?? item.actor_href;
}

type Props = {
  item: NotificationCenterItem;
  overrides: Record<string, string>;
  markRead: (id: string) => void;
  dispatch: (a: NotificationCenterAction) => void;
};

export const NotificationRow = memo(function NotificationRow({ item, overrides, markRead, dispatch }: Props) {
  const n = item.row;
  const read = Boolean(effectiveReadAt(n, overrides));
  const href = useMemo(() => primaryHref(item), [item]);
  const kind = n.type as MockNotificationType;

  const onOpen = () => {
    recordNotificationOpened(n.type);
    markRead(n.id);
  };

  return (
    <li
      className={cn(
        "ntf-feed-row",
        !read && "ntf-feed-row--unread",
        item.importance === "critical" && "ntf-feed-row--critical",
        item.starred && "ntf-feed-row--starred",
      )}
      data-importance={item.importance}
    >
      <div className={cn("ntf-unread-bar", read && "ntf-unread-bar--read")} aria-hidden />
      <Link
        href={item.actor_href}
        onClick={(e) => e.stopPropagation()}
        className={cn("ntf-row-avatar", !read && "ntf-row-avatar--live")}
        aria-label={`${n.actor_display} profili`}
      >
        {n.actor_avatar_url ? (
          <SafeAvatar src={n.actor_avatar_url} alt="" size={44} className="h-11 w-11" />
        ) : (
          <span className="ntf-avatar-fallback">{n.actor_display.slice(0, 1).toUpperCase()}</span>
        )}
        <TypeDot type={kind} />
      </Link>
      <div className="ntf-row-body">
        <div className="ntf-row-meta">
          <div className="ntf-row-tags">
            <span className="ntf-row-kind" data-tone={kind.includes("premium") || kind.includes("signal") ? "premium" : undefined}>
              {getNotificationKindLabel(kind)}
            </span>
            {item.starred ? <span className="ntf-row-star">Önemli</span> : null}
            {item.importance === "critical" ? <span className="ntf-row-critical">Kritik</span> : null}
            {!read ? <span className="ntf-unread-dot" title="Okunmadı" aria-label="Okunmadı" /> : null}
          </div>
          <time className="ntf-row-time" dateTime={n.created_at}>
            {formatSocialRelativeTime(n.created_at)}
          </time>
        </div>
        <Link href={href} onClick={onOpen} className="ntf-row-open">
          <p className="ntf-row-title">{n.title}</p>
          <p className="ntf-row-body-text">{n.body}</p>
        </Link>
        {item.relevance_line ? <p className="ntf-row-relevance">{item.relevance_line}</p> : null}
        <p className="ntf-row-actor">
          <Link href={item.actor_href} className="ntf-row-actor-link">
            {n.actor_display}
          </Link>
          {n.actor_verified ? <span className="ntf-verified"> · doğrulanmış</span> : null}
        </p>
        <NotificationRowActions item={item} markRead={markRead} dispatch={dispatch} />
      </div>
    </li>
  );
});
