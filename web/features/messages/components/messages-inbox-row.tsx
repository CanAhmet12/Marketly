"use client";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import type { SmartConversationItem } from "@/features/messages/domain/types";
import {
  conversationKind,
  extConversation,
  MESSAGE_KIND_LABELS,
} from "@/features/messages/lib/message-conversation-utils";
import { formatSocialRelativeTime } from "@/features/social/lib/social-format";
import { cn } from "@/lib/cn";

type Props = {
  item: SmartConversationItem;
  active: boolean;
  onSelect: (id: string) => void;
};

export function MessagesInboxRow({ item, active, onSelect }: Props) {
  const c = item.row;
  const k = conversationKind(c);
  const row = extConversation(c);
  const unread = c.unread_count > 0;
  const online = c.online_participant_ids.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(c.id)}
      className={cn(
        "msg-conv-btn",
        active && "msg-conv-btn--active",
        unread && "msg-conv-btn--unread",
      )}
    >
      <div className="msg-avatar-wrap">
        {c.avatar_url ? (
          <SafeAvatar src={c.avatar_url} alt="" size={40} className="h-10 w-10 rounded-full ring-1 ring-white/10" />
        ) : (
          <div className="msg-avatar-init">{c.title.slice(0, 1)}</div>
        )}
        {online && !c.is_group ? <span className="msg-online-dot" aria-label="Çevrimiçi" /> : null}
        {c.is_group && <span className="msg-group-badge">Grup</span>}
      </div>

      <div className="msg-conv-info">
        <div className="msg-kind-row">
          <span className="msg-kind-label">{MESSAGE_KIND_LABELS[k]}</span>
          {item.ring_labels.map((lb) => (
            <span key={lb} className="msg-ring-label">
              {lb}
            </span>
          ))}
        </div>
        <div className="msg-title-row">
          <span className={cn("msg-conv-title", unread && "msg-conv-title--unread")}>{c.title}</span>
          <span className={cn("msg-conv-time", unread && "msg-conv-time--unread")}>
            {formatSocialRelativeTime(c.last_message.created_at)}
          </span>
        </div>
        {c.subtitle && <div className="msg-conv-sub">{c.subtitle}</div>}
        {item.context_preview && <div className="msg-ctx-preview">{item.context_preview}</div>}
        {row.intel?.market_line && <div className="msg-market-line">{row.intel.market_line}</div>}
        <div className="msg-last-row">
          <div className={cn("msg-last-msg", unread && "msg-last-msg--unread")}>{c.last_message.content}</div>
          {unread && (
            <span className="msg-unread-badge" aria-label={`${c.unread_count} okunmamış`}>
              {c.unread_count > 99 ? "99+" : c.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
