import { redirect } from "next/navigation";

/** Eski `/markets` ana sayfa kaldırıldı; varsayılan kategori girişi. */
export default function MarketsPage() {
  redirect("/markets/category/crypto");
}
