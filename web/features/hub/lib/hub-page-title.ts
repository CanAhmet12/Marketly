import { HUB_NAV_FLAT } from "@/features/hub/lib/hub-nav-config";

export function resolveHubPageTitle(pathname: string): string {
  if (pathname === "/hub" || pathname === "/hub/") return "Profil";
  const exact = HUB_NAV_FLAT.find((item) => {
    if (item.end) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  if (exact) return exact.label;
  if (pathname.startsWith("/hub/messages/")) return "Mesajlar";
  if (pathname.startsWith("/hub/studio")) return "Creator Studio";
  if (pathname.startsWith("/hub/upload")) return "İçerik Oluştur";
  return "Kanalım";
}
