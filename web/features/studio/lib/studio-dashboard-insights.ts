import type { StudioDashboardOverview } from "@/features/studio/repository/types";

export type StudioDashboardNotification = {
  id: string;
  title: string;
  body: string;
  href?: string;
  tone: "info" | "action" | "success";
};

export type StudioDashboardTip = {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

export function buildStudioNotifications(data: StudioDashboardOverview): StudioDashboardNotification[] {
  const items: StudioDashboardNotification[] = [];

  if (data.draftCount > 0) {
    items.push({
      id: "drafts",
      title: `${data.draftCount} taslak bekliyor`,
      body: "Yarım kalan içerikleri tamamlayın.",
      href: "/studio/drafts",
      tone: "action",
    });
  }

  if (data.scheduledCount > 0) {
    items.push({
      id: "scheduled",
      title: `${data.scheduledCount} zamanlanmış yayın`,
      body: "Yayın takviminizi kontrol edin.",
      href: "/studio/scheduled",
      tone: "info",
    });
  }

  if (data.followerGrowth7d > 0) {
    items.push({
      id: "growth",
      title: `+${data.followerGrowth7d} yeni takipçi (7g)`,
      body: "Büyüme ivmeniz devam ediyor.",
      href: "/studio/analytics",
      tone: "success",
    });
  }

  if (data.totalViews > 0) {
    items.push({
      id: "views",
      title: "Görüntülenme özeti",
      body: `${data.publishedCount} içerikte toplam aktivite izleniyor.`,
      href: "/studio/analytics",
      tone: "info",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "welcome",
      title: "Creator Studio hazır",
      body: "İlk içeriğinizi yükleyerek metrikleri aktifleştirin.",
      href: "/upload",
      tone: "action",
    });
  }

  return items.slice(0, 4);
}

export function buildStudioTips(data: StudioDashboardOverview, hasContent: boolean): StudioDashboardTip[] {
  if (!hasContent) {
    return [
      {
        id: "first",
        title: "İlk içeriğini yayınla",
        body: "Upload merkezinden video, gönderi veya sinyal paylaşın.",
        href: "/upload",
        cta: "Yükle",
      },
    ];
  }

  const tips: StudioDashboardTip[] = [];

  if (data.draftCount > 0) {
    tips.push({
      id: "finish-draft",
      title: "Taslaklarını tamamla",
      body: "Yarım kalan içerik keşfet görünürlüğünü düşürür.",
      href: "/studio/drafts",
      cta: "Taslaklar",
    });
  }

  if (data.publishedCount < 3) {
    tips.push({
      id: "consistency",
      title: "Düzenli yayın planı",
      body: "Haftada 2–3 içerik keşfet görünürlüğünü artırır.",
      href: "/upload",
      cta: "Planla",
    });
  }

  tips.push({
    id: "live",
    title: "Canlı yayın dene",
    body: "Piyasa hareketlerini canlı yorumlayın.",
    href: "/studio/live",
    cta: "Canlı",
  });

  tips.push({
    id: "analytics",
    title: "Analitik derinleştir",
    body: "Hangi içerik türü daha iyi performans gösteriyor?",
    href: "/studio/analytics",
    cta: "Analitik",
  });

  return tips.slice(0, 3);
}
