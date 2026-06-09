export type CardTagTone = "macro" | "crypto" | "bist" | "commodity" | "deriv" | "forex" | "default";

export function getCardTagTone(tag: string): CardTagTone {
  const t = tag.toUpperCase();
  if (/BTC|ETH|CRYPTO|SOL|BNB|KRİPTO|KRIPTO/.test(t)) return "crypto";
  if (/BIST|THYAO|GARAN|XU100|NASDAQ|NDX/.test(t)) return "bist";
  if (/XAU|XAG|ALTIN|GOLD|EMTİA|EMTIA|GÜMÜŞ|GUMUS|SILVER/.test(t)) return "commodity";
  if (/VIOP|OPSİYON|OPSIYON|DERIV/.test(t)) return "deriv";
  if (/USD|TRY|DÖVİZ|DOVIZ|FOREX|EUR/.test(t)) return "forex";
  if (/TCMB|FAİZ|FAIZ|MAKRO|MACRO|FED|SPX|PİYASA|PIYASA|CANLI/.test(t)) return "macro";
  return "default";
}
