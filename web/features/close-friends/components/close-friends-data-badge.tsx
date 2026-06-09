import type { CloseFriendsHubPayload } from "@/features/close-friends/domain/types";

type Props = {
  dataMode: CloseFriendsHubPayload["data_mode"];
  writeEnabled?: boolean;
  mockOn?: boolean;
};

const LABELS: Record<CloseFriendsHubPayload["data_mode"], string> = {
  mock: "Demo veri",
  live: "Canlı liste",
  live_sparse: "Canlı · seyrek",
};

export function CloseFriendsDataBadge({ dataMode, writeEnabled, mockOn }: Props) {
  if (mockOn || dataMode === "mock") {
    return <span className="cf-data-badge cf-data-badge--mock">Demo</span>;
  }
  return (
    <span className="cf-data-badge" data-mode={dataMode}>
      {LABELS[dataMode]}
      {writeEnabled ? " · yazma açık" : " · salt okuma"}
    </span>
  );
}
