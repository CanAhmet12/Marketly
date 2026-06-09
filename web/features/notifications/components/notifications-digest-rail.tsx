import Link from "next/link";

import type { NotificationDigestCard } from "@/features/notifications/domain/types";
import { NotificationsSectionHeader } from "@/features/notifications/components/notifications-ui";

const TONE_LABELS: Record<NotificationDigestCard["tone"], string> = {
  market: "Piyasa",
  creator: "Üretici",
  premium: "Premium",
  portfolio: "Portföy",
  signal: "Sinyal",
};

type Props = { digests: NotificationDigestCard[] };

export function NotificationsDigestRail({ digests }: Props) {
  if (digests.length === 0) return null;

  return (
    <section className="ntf-digest-block">
      <NotificationsSectionHeader title="Günün özetleri" desc="Tek dokunuşla ilgili yüzeye geç" />
      <div className="ntf-digest-rail">
        {digests.map((d) => (
          <Link key={d.id} href={d.href} className="ntf-digest-card" data-tone={d.tone}>
            <span className="ntf-digest-tone">{TONE_LABELS[d.tone]}</span>
            <span className="ntf-digest-card-title">{d.title}</span>
            <span className="ntf-digest-card-sub">{d.subline}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
