import type { SubscriptionsHubPayload } from "@/features/subscriptions/domain/types";

type Props = {
  payload: Pick<SubscriptionsHubPayload, "platform_intel" | "strategy_profile_label" | "cold_start" | "affinity_line">;
};

export function SubscriptionsIntelStrip({ payload }: Props) {
  const { platform_intel, strategy_profile_label, cold_start, affinity_line } = payload;

  return (
    <>
      <div className="sub-status-row">
        <span>
          Strateji profili: <strong>{strategy_profile_label}</strong>
        </span>
        {cold_start ? <span className="sub-status-badge">Soğuk başlangıç — etkileşimle kişiselleşir</span> : null}
        {affinity_line.trim() ? <span>{affinity_line}</span> : null}
      </div>
      <ul className="sub-intel-list" aria-label="Platform özeti">
        <li>{platform_intel.premium_circulation_label}</li>
        <li>{platform_intel.room_desk_label}</li>
        <li>{platform_intel.signal_archive_label}</li>
      </ul>
    </>
  );
}
