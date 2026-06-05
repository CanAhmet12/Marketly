"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { insertFollow } from "@/features/channel/fetch-follow";
import { showMutationToast } from "@/lib/ui/mutation-toast";
import { isMockDataEnabled } from "@/mock/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type Props = {
  creatorUserId: string;
  viewerId: string | null;
};

export function RailCreatorFollow({ creatorUserId, viewerId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [optimisticFollowing, setOptimisticFollowing] = useState(false);

  if (!viewerId) {
    const next = encodeURIComponent(`/channel/${creatorUserId}`);
    return (
      <Link href={`/auth/login?next=${next}`} className="hv-ref-rail__follow">
        Takip Et
      </Link>
    );
  }

  const authenticatedViewerId = viewerId;
  const following = optimisticFollowing;

  async function onFollow() {
    setPending(true);
    setOptimisticFollowing(true);
    try {
      if (isMockDataEnabled()) {
        router.push(`/channel/${encodeURIComponent(creatorUserId)}`);
        return;
      }
      const client = getSupabaseBrowserClient();
      const res = await insertFollow(client, authenticatedViewerId, creatorUserId);
      if (!res.ok) {
        setOptimisticFollowing(false);
        showMutationToast("Takip işlemi başarısız. Tekrar deneyin.");
        router.push(`/channel/${encodeURIComponent(creatorUserId)}`);
        return;
      }
      router.refresh();
    } catch {
      setOptimisticFollowing(false);
      showMutationToast("Takip işlemi başarısız. Tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={cn("hv-ref-rail__follow", (pending || following) && "engagement-pending")}
      disabled={pending}
      aria-busy={pending}
      onClick={() => void onFollow()}
    >
      {following ? "Takiptesin" : pending ? "…" : "Takip Et"}
    </button>
  );
}
