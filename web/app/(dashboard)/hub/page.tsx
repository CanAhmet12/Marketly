import { redirect } from "next/navigation";

/** Kanalım giriş — Genel Bakış kaldırıldı; profil varsayılan */
export default function HubPage() {
  redirect("/hub/profile");
}
