import type { SubscriptionsHubPayload } from "@/features/subscriptions/domain/types";

type Props = {
  dataMode: SubscriptionsHubPayload["data_mode"];
  writeEnabled?: boolean;
  mockOn?: boolean;
};

const LABELS: Record<SubscriptionsHubPayload["data_mode"], string> = {
  mock: "Demo veri",
  live: "Canlı katalog",
  live_sparse: "Canlı · seyrek",
};

export function SubscriptionsDataBadge({ dataMode, writeEnabled, mockOn }: Props) {
  if (mockOn || dataMode === "mock") {
    return <span className="sub-data-badge sub-data-badge--mock">Demo</span>;
  }

  return (
    <span className="sub-data-badge" data-mode={dataMode}>
      {LABELS[dataMode]}
      {writeEnabled ? " · yazma açık" : " · salt okuma"}
    </span>
  );
}
