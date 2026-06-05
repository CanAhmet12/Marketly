/** Piyasalar hub — `/markets` varsayılan redirect hedefi. */
export const MARKETS_HUB_PATH = "/markets/category/crypto";

export function marketsCategoryPath(slug: string): string {
  return `/markets/category/${encodeURIComponent(slug)}`;
}

export function marketSymbolPath(symbol: string): string {
  return `/markets/${encodeURIComponent(symbol.trim())}`;
}
