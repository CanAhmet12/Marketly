"use client";

import Image from "next/image";
import Link from "next/link";

import type { TrustedMemberCard } from "@/features/close-friends/domain/types";
import { useCloseFriendActions } from "@/features/close-friends/hooks/use-close-friend-actions";
import { cn } from "@/lib/cn";

type Props = {
  members: TrustedMemberCard[];
  viewerId: string;
  writeEnabled?: boolean;
  mockOn: boolean;
};

export function CloseFriendsTrustedList({ members, viewerId, writeEnabled, mockOn }: Props) {
  const { removeCloseFriend, isSubmitting, error, clearError } = useCloseFriendActions(mockOn);
  const canWrite = mockOn || Boolean(writeEnabled);

  if (members.length === 0) {
    return (
      <p className="cf-empty-hint">
        Yakın takip listen boş. Aşağıdan takip ettiklerin arasından ekleyebilir veya{" "}
        <Link href="/hub/settings" className="cf-quick-link">
          ayarlara
        </Link>{" "}
        gidebilirsin.
      </p>
    );
  }

  const handleRemove = async (member: TrustedMemberCard) => {
    if (!canWrite) return;
    if (!window.confirm(`${member.full_name ?? member.username} yakın arkadaş listenden çıkarılsın mı?`)) return;
    clearError();
    await removeCloseFriend({ userId: viewerId, friendId: member.id });
  };

  return (
    <>
      <ul className="cf-trusted-list">
        {members.map((m) => (
          <li key={m.id} className="cf-trusted-row">
            <div className="cf-trusted-identity">
              <div className="cf-trusted-avatar">
                {m.avatar_url ? (
                  <Image src={m.avatar_url} alt={m.full_name ?? m.username} fill className="object-cover" sizes="36px" />
                ) : (
                  <span className="cf-trusted-avatar-fallback">
                    {(m.full_name ?? m.username).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="cf-trusted-name">{m.full_name ?? m.username}</p>
                <p className="cf-trusted-meta">@{m.username}</p>
                <p className="cf-trusted-meta" style={{ marginTop: 4, color: "color-mix(in srgb, var(--cf-zone) 75%, var(--cf-meta))" }}>
                  {m.trust_line}
                </p>
              </div>
            </div>
            <div className="cf-trusted-actions">
              <Link href={m.channel_href} className="cf-trusted-link">
                Kanal
              </Link>
              <button
                type="button"
                className={cn("cf-trusted-link", "cf-trusted-link--muted")}
                disabled={!canWrite || isSubmitting}
                onClick={() => void handleRemove(m)}
              >
                {isSubmitting ? "…" : "Çıkar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="cf-save-banner" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
