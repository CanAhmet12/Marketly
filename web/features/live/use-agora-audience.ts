"use client";

import { useEffect, useRef, useState } from "react";

import { fetchAgoraRtcToken } from "@/features/live/fetch-agora-token";
import { getAgoraAppId, isAgoraConfigured } from "@/lib/agora-env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AgoraAudienceState = {
  joined: boolean;
  remoteReady: boolean;
  error: string | null;
};

const INITIAL: AgoraAudienceState = { joined: false, remoteReady: false, error: null };

/**
 * Agora RTC — izleyici (audience) rolü.
 * SDK yalnızca istemci tarafında dinamik yüklenir (SSR güvenli).
 */
export function useAgoraAudience(channelName: string | null, enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AgoraAudienceState>(INITIAL);

  useEffect(() => {
    if (!enabled || !channelName || !isAgoraConfigured()) {
      setState(INITIAL);
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let client: any = null;

    void (async () => {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        if (cancelled) return;

        client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

        client.on(
          "user-published",
          async (
            user: {
              uid: number;
              videoTrack?: { play: (el: HTMLElement) => void };
              audioTrack?: { play: () => void };
            },
            mediaType: "audio" | "video",
          ) => {
            await client.subscribe(user, mediaType);
            if (cancelled) return;
            if (mediaType === "video" && user.videoTrack && containerRef.current) {
              user.videoTrack.play(containerRef.current);
              setState((s) => ({ ...s, remoteReady: true }));
            }
            if (mediaType === "audio" && user.audioTrack) {
              user.audioTrack.play();
            }
          },
        );

        client.on("user-unpublished", (_user: unknown, mediaType: "audio" | "video") => {
          if (mediaType === "video" && !cancelled) {
            setState((s) => ({ ...s, remoteReady: false }));
          }
        });

        await client.setClientRole("audience");

        let token: string | null = null;
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseBrowserClient();
            const res = await fetchAgoraRtcToken(supabase, channelName, "subscriber", 0);
            token = res?.token ?? null;
          } catch {
            token = null;
          }
        }

        await client.join(getAgoraAppId(), channelName, token || null, null);
        if (!cancelled) {
          setState({ joined: true, remoteReady: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Agora bağlantısı kurulamadı";
          setState({ joined: false, remoteReady: false, error: msg });
        }
      }
    })();

    return () => {
      cancelled = true;
      void (async () => {
        try {
          if (client) {
            await client.leave();
            client.removeAllListeners();
          }
        } catch {
          /* cleanup */
        }
      })();
    };
  }, [channelName, enabled]);

  return { containerRef, state, agoraAvailable: isAgoraConfigured() };
}
