"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  fetchChannelFollowList,
  type ChannelFollowListKind,
} from "@/features/channel/fetch-channel-follow-list";
import { avatarUrl as fallbackAvatar } from "@/lib/avatar-url";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  channelUserId: string;
  kind: ChannelFollowListKind | null;
  onClose: () => void;
};

export function ChannelFollowListSheet({ channelUserId, kind, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const listQuery = useQuery({
    queryKey: kind ? queryKeys.channelFollowList(channelUserId, kind) : ["channel-follow-list", "closed"],
    enabled: Boolean(kind),
    queryFn: () => fetchChannelFollowList(getSupabaseBrowserClient(), channelUserId, kind!),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  useEffect(() => {
    if (!kind) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [kind]);

  if (!kind) return null;

  const title = kind === "followers" ? "Takipçiler" : "Takip Edilenler";
  const rows = listQuery.data ?? [];

  return (
    <div className="ch-follow-sheet" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="ch-follow-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ch-follow-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ch-follow-sheet-header">
          <h2 id="ch-follow-sheet-title" className="ch-follow-sheet-title">{title}</h2>
          <button type="button" className="ch-follow-sheet-close" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>

        <div className="ch-follow-sheet-body">
          {listQuery.isLoading ? (
            <p className="ch-follow-sheet-status">Yükleniyor…</p>
          ) : listQuery.isError ? (
            <p className="ch-follow-sheet-status">Liste yüklenemedi.</p>
          ) : rows.length === 0 ? (
            <p className="ch-follow-sheet-status">
              {kind === "followers" ? "Henüz takipçi yok." : "Henüz takip edilen yok."}
            </p>
          ) : (
            <ul className="ch-follow-sheet-list">
              {rows.map((u) => {
                const name = u.full_name?.trim() || u.username;
                const src = u.avatar_url?.trim() ? u.avatar_url : fallbackAvatar(u.id, name);
                return (
                  <li key={u.id}>
                    <Link href={`/channel/${encodeURIComponent(u.id)}`} className="ch-follow-sheet-row" onClick={onClose}>
                      <img src={src} alt="" className="ch-follow-sheet-avatar" />
                      <span className="ch-follow-sheet-info">
                        <span className="ch-follow-sheet-name">
                          {name}
                          {u.verified ? <span className="ch-follow-sheet-verified">✓</span> : null}
                        </span>
                        <span className="ch-follow-sheet-handle">@{u.username}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
