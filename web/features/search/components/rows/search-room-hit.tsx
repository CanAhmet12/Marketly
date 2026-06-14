"use client";

import Link from "next/link";

import type { CreatorRoomSearchHit } from "@/features/search/types";

type Props = { room: CreatorRoomSearchHit };

export function SearchRoomHit({ room }: Props) {
  return (
    <Link href={room.href} className="srch-hit srch-hit--thread srch-hit--room">
      <div className="srch-hit__thread-head">
        <h3 className="srch-hit__thread-title">{room.title}</h3>
        {room.premium_badge ? <span className="srch-hit__premium">Abone</span> : null}
      </div>
      <p className="srch-hit__thread-snippet">{room.subtitle}</p>
      <div className="srch-hit__meta">
        <span>{room.creator_name}</span>
      </div>
    </Link>
  );
}
