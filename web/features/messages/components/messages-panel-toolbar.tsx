import { MessagesDataBadge } from "@/features/messages/components/messages-data-badge";
import { MESSAGE_STREAM_LABELS } from "@/features/messages/messages-section-params";
import type { MessageInboxStreamId } from "@/features/messages/domain/types";
import { cn } from "@/lib/cn";

type Props = {
  stream: MessageInboxStreamId;
  visibleCount: number;
  totalUnread: number;
  mockOn: boolean;
  unreadOnly: boolean;
  onToggleUnread: () => void;
};

export function MessagesPanelToolbar({
  stream,
  visibleCount,
  totalUnread,
  mockOn,
  unreadOnly,
  onToggleUnread,
}: Props) {
  return (
    <div className="msg-panel-toolbar">
      <div className="msg-panel-toolbar-left">
        <MessagesDataBadge mockOn={mockOn} />
        <span className="msg-panel-stream">
          {MESSAGE_STREAM_LABELS[stream]} · {visibleCount} sohbet
        </span>
      </div>
      <div className="msg-panel-toolbar-right">
        <button
          type="button"
          className={cn("msg-filter-btn", unreadOnly && "msg-filter-btn--on")}
          aria-pressed={unreadOnly}
          onClick={onToggleUnread}
        >
          Okunmamış{totalUnread > 0 ? ` (${totalUnread > 99 ? "99+" : totalUnread})` : ""}
        </button>
      </div>
    </div>
  );
}
