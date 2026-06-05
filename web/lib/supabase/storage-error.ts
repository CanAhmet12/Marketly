/** Depolama yükleme hatalarında kullanıcı dostu mesaj. */
export function friendlyStorageMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("row-level security") || m.includes("new row violates") || m.includes("permission denied")) {
    return "Depolama izni reddedildi. Oturumunuzu kontrol edip tekrar giriş yapın.";
  }
  if (m.includes("jwt") || m.includes("expired") || m.includes("invalid")) {
    return "Oturum süresi doldu. Tekrar giriş yapıp yüklemeyi deneyin.";
  }
  if (m.includes("payload too large") || m.includes("entity too large")) {
    return "Dosya sunucu limitini aşıyor.";
  }
  if (m.includes("mime") || m.includes("content type")) {
    return "Sunucu bu dosya türünü kabul etmedi.";
  }
  return raw;
}
