type Props = { mockOn?: boolean };

export function NotificationsDataBadge({ mockOn }: Props) {
  if (mockOn) {
    return <span className="ntf-data-badge ntf-data-badge--mock">Demo</span>;
  }
  return <span className="ntf-data-badge" data-mode="live">Canlı · olay akışı</span>;
}
