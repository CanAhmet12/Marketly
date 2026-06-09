"use client";

import Image from "next/image";
import Link from "next/link";

import type { MembershipDetailPayload } from "@/features/subscriptions/domain/types";

type Props = {
  detail: MembershipDetailPayload;
};

export function MembershipDetailHeader({ detail }: Props) {
  return (
    <header className="sub-detail-header">
      <div className="sub-detail-identity">
        <div className="sub-detail-avatar">
          {detail.avatar_url ? (
            <Image src={detail.avatar_url} alt={detail.display_name} fill className="object-cover" sizes="64px" />
          ) : (
            <span className="sub-creator-avatar-fallback" style={{ fontSize: 18 }}>
              {detail.display_name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="sub-detail-kicker">Üyelik özeti</p>
          <h1 className="sub-detail-title">{detail.display_name}</h1>
          <p className="sub-detail-handle">{detail.handle}</p>
          {detail.verified ? (
            <span className="sub-creator-verified" style={{ display: "inline-block", marginTop: 4 }}>
              Doğrulanmış üretici
            </span>
          ) : null}
        </div>
      </div>
      <div className="sub-detail-actions">
        <Link href={detail.links.channel} className="sub-detail-btn">
          Kanal
        </Link>
        <Link href={detail.links.rooms_tab} className="sub-detail-btn">
          Odalar
        </Link>
        <Link href={detail.links.signals} className="sub-detail-btn sub-detail-btn--primary">
          Sinyaller
        </Link>
      </div>
    </header>
  );
}
