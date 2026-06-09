import Link from "next/link";

import type { MembershipDetailPayload } from "@/features/subscriptions/domain/types";

type Props = Pick<MembershipDetailPayload, "room_previews" | "discussion_previews" | "signal_previews">;

export function MembershipPreviewColumns({ room_previews, discussion_previews, signal_previews }: Props) {
  return (
    <div className="sub-preview-grid">
      <section className="sub-preview-col">
        <h3 className="sub-preview-col-title">Oda önizleme</h3>
        {room_previews.length === 0 ? (
          <p className="sub-empty-hint">Önizlenecek oda yok.</p>
        ) : (
          <ul className="sub-preview-list">
            {room_previews.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="sub-preview-item-title">
                  {r.label}
                </Link>
                <p className="sub-preview-item-meta">
                  {r.kind_label}
                  {r.premium ? " · premium" : ""} · {r.heat_label}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sub-preview-col">
        <h3 className="sub-preview-col-title">Tartışma & thread</h3>
        {discussion_previews.length === 0 ? (
          <p className="sub-empty-hint">Önizleme yok.</p>
        ) : (
          <ul className="sub-preview-list">
            {discussion_previews.map((d) => (
              <li key={d.id}>
                <Link href={d.href} className="sub-preview-item-title">
                  {d.label}
                </Link>
                <p className="sub-preview-item-meta">{d.sub}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sub-preview-col">
        <h3 className="sub-preview-col-title">Sinyal önizleme</h3>
        {signal_previews.length === 0 ? (
          <p className="sub-empty-hint">Açık çağrı yok — kanal sinyal sekmesine git.</p>
        ) : (
          <ul className="sub-preview-list">
            {signal_previews.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="sub-preview-item-title">
                  {s.symbol} · {s.direction}
                </Link>
                <p className="sub-preview-item-meta">{s.access_label}</p>
                <p className="sub-preview-item-meta">{s.thesis_snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
