import Link from "next/link";

import type { PrivateFeedItem } from "@/features/close-friends/domain/types";

type Props = { items: PrivateFeedItem[] };

export function CloseFriendsFeedList({ items }: Props) {
  if (items.length === 0) {
    return <p className="cf-empty-hint">Özel akışta öğe yok. Dairelerine katıldıkça güncellemeler burada görünür.</p>;
  }

  return (
    <ul className="cf-feed-list">
      {items.map((row) => (
        <li key={row.id} className="cf-feed-row">
          {row.href ? (
            <Link href={row.href} className="cf-feed-title">
              {row.title}
            </Link>
          ) : (
            <span className="cf-feed-title">{row.title}</span>
          )}
          <p className="cf-feed-meta">{row.sub}</p>
          <div className="cf-feed-tags">
            <span>{row.kind.replace(/_/g, " ")}</span>
            {row.trust_line ? <span className="cf-feed-trust">{row.trust_line}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
