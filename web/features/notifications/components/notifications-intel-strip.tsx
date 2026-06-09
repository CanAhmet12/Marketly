import type { NotificationCenterPayload } from "@/features/notifications/domain/types";
import type { NotificationIntelSnapshot } from "@/features/notifications/lib/build-notification-intel";

type Props = {
  hub: Pick<NotificationCenterPayload, "adaptive_subline" | "fatigue_note">;
  intel: NotificationIntelSnapshot;
  hydrated: boolean;
  streamLabel: string;
};

export function NotificationsIntelStrip({ hub, intel, hydrated, streamLabel }: Props) {
  const stats = [
    { label: "Okunmamış", value: hydrated ? String(intel.unread) : "—", accent: intel.unread > 0 },
    { label: "Kritik", value: hydrated ? String(intel.critical) : "—", accent: intel.critical > 0 },
    { label: "Önemli", value: hydrated ? String(intel.starred) : "—" },
    { label: "Premium", value: hydrated ? String(intel.premium) : "—" },
  ];

  return (
    <section className="ntf-intel-block" aria-label="Bildirim özeti">
      <div className="ntf-status-row">
        <span>
          Akış · <strong>{streamLabel}</strong>
        </span>
        {hydrated ? (
          <span>
            Güven · <strong>{intel.confidence}</strong>
          </span>
        ) : null}
        {hub.adaptive_subline.trim() ? <span>{hub.adaptive_subline}</span> : null}
        {hub.fatigue_note ? <span className="ntf-status-badge">{hub.fatigue_note}</span> : null}
      </div>

      <dl className="ntf-intel-grid">
        {stats.map((s) => (
          <div key={s.label} className="ntf-intel-stat" data-accent={s.accent ? "true" : undefined}>
            <dt className="ntf-intel-label">{s.label}</dt>
            <dd className="ntf-intel-value">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
