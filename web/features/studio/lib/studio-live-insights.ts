import type { StudioLiveCommand } from "@/features/studio/repository/types";
import { isAgoraConfigured } from "@/lib/agora-env";

export type StudioLiveHealth = {
  agoraConfigured: boolean;
  isLive: boolean;
  viewerCount: number;
  connectionLabel: string;
  connectionTone: "ok" | "warn" | "off";
};

export type StudioLiveTip = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type StudioLiveObsStep = {
  id: string;
  label: string;
  done: boolean;
};

export function buildLiveHealth(command: StudioLiveCommand): StudioLiveHealth {
  const agoraConfigured = isAgoraConfigured();
  const isLive = Boolean(command.activeSession);
  const viewerCount = command.activeSession?.viewerCount ?? 0;

  if (isLive && agoraConfigured) {
    return {
      agoraConfigured,
      isLive,
      viewerCount,
      connectionLabel: "Yayın aktif · Agora bağlı",
      connectionTone: "ok",
    };
  }

  if (isLive) {
    return {
      agoraConfigured,
      isLive,
      viewerCount,
      connectionLabel: "Yayın aktif · Agora yapılandırması eksik",
      connectionTone: "warn",
    };
  }

  if (agoraConfigured) {
    return {
      agoraConfigured,
      isLive,
      viewerCount,
      connectionLabel: "Hazır · Yayın başlatılabilir",
      connectionTone: "off",
    };
  }

  return {
    agoraConfigured,
    isLive,
    viewerCount,
    connectionLabel: "Agora App ID tanımlı değil",
    connectionTone: "warn",
  };
}

export function buildLiveTips(command: StudioLiveCommand): StudioLiveTip[] {
  const tips: StudioLiveTip[] = [];

  if (command.activeSession) {
    tips.push({
      id: "manage",
      title: "Aktif yayını yönet",
      body: "İzleyici sayısını ve sohbeti canlı sayfadan takip edin.",
      href: command.activeSession.href,
      cta: "Yayına git",
    });
  } else {
    tips.push({
      id: "start",
      title: "Yayın başlat",
      body: "Mobil uygulamadan veya yükleme merkezinden canlı oturum oluşturun.",
      href: "/upload",
      cta: "Yükle",
    });
  }

  if (command.scheduled.length === 0) {
    tips.push({
      id: "schedule",
      title: "Yayın planla",
      body: "Takipçilerinize önceden duyuru göndermek için zamanlama ekleyin.",
      href: "/studio/scheduled",
      cta: "Zamanla",
    });
  }

  tips.push({
    id: "signal-room",
    title: "Sinyal odası formatı",
    body: "Aktif sinyallerinizi canlı yorumla — Marketly'ye özgü format.",
    href: "/signals",
    cta: "Sinyaller",
  });

  return tips.slice(0, 3);
}

export function buildObsChecklist(command: StudioLiveCommand): StudioLiveObsStep[] {
  const hasTitle = Boolean(command.activeSession?.title || command.scheduled[0]?.title);
  return [
    { id: "agora", label: "Agora RTC yapılandırması", done: isAgoraConfigured() },
    { id: "title", label: "Yayın başlığı belirlendi", done: hasTitle },
    { id: "schedule", label: "Programlı yayın planı", done: command.scheduled.length > 0 },
    { id: "session", label: "Aktif oturum açıldı", done: Boolean(command.activeSession) },
  ];
}

export function formatLiveDuration(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  if (ms < 0) return "0 dk";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} dk`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}s ${m}dk`;
}
