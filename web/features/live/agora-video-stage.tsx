"use client";

import { useAgoraAudience } from "@/features/live/use-agora-audience";

type Props = {
  channelName: string;
  poster?: string | null;
};

export function AgoraVideoStage({ channelName, poster }: Props) {
  const { containerRef, state, agoraAvailable } = useAgoraAudience(channelName, true);

  if (!agoraAvailable) {
    return (
      <div className="live-watch__placeholder">
        <span className="live-watch__placeholder-dot" aria-hidden />
        <p className="live-watch__placeholder-title">Canlı yayın</p>
        <p className="live-watch__placeholder-sub">
          Agora App ID eksik. `.env.local` içine NEXT_PUBLIC_AGORA_APP_ID ekleyin.
        </p>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="live-watch__poster" />
        ) : null}
      </div>
    );
  }

  return (
    <div className="live-watch__agora-wrap">
      <div ref={containerRef} className="live-watch__agora" aria-label="Canlı video akışı" />
      {!state.remoteReady ? (
        <div className="live-watch__agora-wait">
          {state.error ? (
            <p className="live-watch__placeholder-sub">{state.error}</p>
          ) : state.joined ? (
            <p className="live-watch__placeholder-sub">Yayıncı bekleniyor…</p>
          ) : (
            <p className="live-watch__placeholder-sub">Canlı akışa bağlanılıyor…</p>
          )}
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="live-watch__poster live-watch__poster--dim" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
