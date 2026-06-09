type Props = { mockOn?: boolean };

export function MessagesDataBadge({ mockOn }: Props) {
  if (mockOn) {
    return <span className="msg-data-badge msg-data-badge--mock">Demo</span>;
  }
  return (
    <span className="msg-data-badge" data-mode="live">
      Canlı · gelen kutusu
    </span>
  );
}
