import Link from "next/link";

import { MessagesSectionHeader } from "@/features/messages/components/messages-section-header";
import type { MessageBridgeStrip } from "@/features/messages/domain/types";

type Props = { strips: MessageBridgeStrip[] };

function stripTone(label: string): string {
  if (label.toLowerCase().includes("premium")) return "premium";
  if (label.toLowerCase().includes("oda")) return "rooms";
  if (label.toLowerCase().includes("sinyal")) return "signal";
  if (label.toLowerCase().includes("piyasa")) return "market";
  return "creator";
}

export function MessagesDigestRail({ strips }: Props) {
  if (strips.length === 0) return null;

  return (
    <section className="msg-digest-block" aria-label="Bağlam köprüleri">
      <MessagesSectionHeader title="Köprü noktaları" desc="Oda, premium ve piyasa bağlamlarına hızlı geçiş" />
      <div className="msg-digest-rail">
        {strips.map((s) => (
          <Link key={s.id} href={s.href} className="msg-digest-card" data-tone={stripTone(s.label)}>
            <span className="msg-digest-tone">{s.label}</span>
            <span className="msg-digest-card-title">{s.sub}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
