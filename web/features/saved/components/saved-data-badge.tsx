type Props = { mockOn?: boolean };

export function SavedDataBadge({ mockOn }: Props) {
  if (mockOn) {
    return <span className="sv-data-badge sv-data-badge--mock">Demo</span>;
  }
  return <span className="sv-data-badge" data-mode="live">Canlı · koleksiyon</span>;
}
