import { NotificationsDataBadge } from "@/features/notifications/components/notifications-data-badge";
import { NOTIFICATION_STREAM_LABELS } from "@/features/notifications/notifications-section-params";
import type { NotificationInboxStreamId } from "@/features/notifications/domain/types";

type Props = {
  stream: NotificationInboxStreamId;
  visibleCount: number;
  mockOn: boolean;
};

export function NotificationsPanelToolbar({ stream, visibleCount, mockOn }: Props) {
  return (
    <div className="ntf-panel-toolbar">
      <div className="ntf-panel-toolbar-left">
        <NotificationsDataBadge mockOn={mockOn} />
        <span className="ntf-panel-stream">
          {NOTIFICATION_STREAM_LABELS[stream]} · {visibleCount} olay
        </span>
      </div>
    </div>
  );
}
