/**
 * useAgoraLive — Agora RTC ile gerçek canlı yayın yönetimi.
 * Yayıncı (broadcaster) ve izleyici (audience) rollerini destekler.
 *
 * Kullanım için .env'e EXPO_PUBLIC_AGORA_APP_ID ekle.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  IRtcEngine,
  ErrorCodeType,
  UserOfflineReasonType,
} from 'react-native-agora';
import { supabase } from '../lib/supabase';

export { RtcSurfaceView };

const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID ?? '';

export type LiveRole = 'broadcaster' | 'audience';

export interface AgoraLiveState {
  joined:       boolean;
  remoteUids:   number[];
  localUid:     number;
  viewers:      number;
  muted:        boolean;
  cameraOff:    boolean;
  error:        string | null;
}

export function useAgoraLive(channelName: string, role: LiveRole) {
  const engineRef = useRef<IRtcEngine | null>(null);

  const [state, setState] = useState<AgoraLiveState>({
    joined:     false,
    remoteUids: [],
    localUid:   0,
    viewers:    0,
    muted:      false,
    cameraOff:  false,
    error:      null,
  });

  // Viewer sayısını Supabase'e kaydet (yayıncı tarafı)
  const updateViewers = useCallback(async (count: number) => {
    if (role !== 'broadcaster') return;
    try {
      await supabase
        .from('live_sessions')
        .update({ viewer_count: count })
        .eq('channel_name', channelName);
    } catch {}
  }, [channelName, role]);

  const joinChannel = useCallback(async () => {
    if (!AGORA_APP_ID) {
      setState(s => ({ ...s, error: 'Agora App ID eksik. .env dosyasına EXPO_PUBLIC_AGORA_APP_ID ekle.' }));
      return;
    }

    try {
      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({ appId: AGORA_APP_ID, logConfig: { level: 0x0001 } });
      engine.enableVideo();
      engine.enableAudio();

      // Event listeners
      engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
        setState(s => ({ ...s, joined: true, localUid: connection.localUid ?? 0, error: null }));
      });

      engine.addListener('onUserJoined', (connection, remoteUid, elapsed) => {
        setState(s => {
          const uids    = [...new Set([...s.remoteUids, remoteUid])];
          const viewers = uids.length;
          updateViewers(viewers);
          return { ...s, remoteUids: uids, viewers };
        });
      });

      engine.addListener('onUserOffline', (connection, remoteUid, reason) => {
        setState(s => {
          const uids    = s.remoteUids.filter(u => u !== remoteUid);
          const viewers = uids.length;
          updateViewers(viewers);
          return { ...s, remoteUids: uids, viewers };
        });
      });

      engine.addListener('onError', (err: ErrorCodeType, msg: string) => {
        setState(s => ({ ...s, error: `Agora hatası: ${msg}` }));
      });

      if (role === 'broadcaster') {
        await engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
        await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
        engine.startPreview();
      } else {
        await engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
        await engine.setClientRole(ClientRoleType.ClientRoleAudience);
      }

      // Token olmadan test modu (NoCert — üretim için token sunucusu gerekir)
      await engine.joinChannel('', channelName, 0, {
        clientRoleType: role === 'broadcaster'
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleAudience,
        publishCameraTrack:     role === 'broadcaster',
        publishMicrophoneTrack: role === 'broadcaster',
        autoSubscribeAudio:     role === 'audience',
        autoSubscribeVideo:     role === 'audience',
      });

    } catch (e: any) {
      setState(s => ({ ...s, error: `Bağlantı hatası: ${e?.message ?? e}` }));
    }
  }, [channelName, role, updateViewers]);

  const leaveChannel = useCallback(async () => {
    try {
      await engineRef.current?.leaveChannel();
      engineRef.current?.release();
      engineRef.current = null;
      setState(s => ({ ...s, joined: false, remoteUids: [], viewers: 0 }));
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setState(s => {
      const muted = !s.muted;
      engineRef.current?.muteLocalAudioStream(muted);
      return { ...s, muted };
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setState(s => {
      const cameraOff = !s.cameraOff;
      engineRef.current?.muteLocalVideoStream(cameraOff);
      return { ...s, cameraOff };
    });
  }, []);

  const switchCamera = useCallback(() => {
    engineRef.current?.switchCamera();
  }, []);

  useEffect(() => {
    joinChannel();
    return () => { leaveChannel(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    engine:       engineRef.current,
    state,
    leaveChannel,
    toggleMute,
    toggleCamera,
    switchCamera,
  };
}
