/** Federated "Tümü" bölüm sırası — sorgu intent’ine göre */

export type FederatedSectionKey =
  | "markets"
  | "signals"
  | "creators"
  | "videos"
  | "pulse"
  | "live"
  | "posts"
  | "discussions"
  | "communities"
  | "rooms";

const DEFAULT_ORDER: FederatedSectionKey[] = [
  "markets",
  "signals",
  "creators",
  "videos",
  "live",
  "pulse",
  "posts",
  "discussions",
  "communities",
  "rooms",
];

function looksLikeSymbol(q: string): boolean {
  const t = q.trim();
  if (t.length < 2 || t.length > 12) return false;
  if (/^[@#]/.test(t)) return false;
  return /^[A-Za-z0-9./_-]+$/.test(t) && /[A-Za-z]/.test(t);
}

function looksLikePerson(q: string): boolean {
  const t = q.trim();
  return t.startsWith("@") || (t.includes(" ") && !looksLikeSymbol(t));
}

export function rankFederatedSections(query: string, present: Set<FederatedSectionKey>): FederatedSectionKey[] {
  const symbol = looksLikeSymbol(query);
  const person = looksLikePerson(query);

  let order = [...DEFAULT_ORDER];
  if (symbol) {
    order = ["markets", "signals", "videos", "creators", "live", "pulse", "posts", "discussions", "communities", "rooms"];
  } else if (person) {
    order = ["creators", "rooms", "posts", "videos", "signals", "markets", "live", "pulse", "discussions", "communities"];
  }

  return order.filter((k) => present.has(k)).slice(0, 6);
}
