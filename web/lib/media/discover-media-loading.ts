/** Keşfet üst katman thumb'ları — ilk açılışta eager yükle */
export const DISCOVER_EAGER_THUMB_COUNT = 12;

export function isDiscoverEagerThumb(index: number | undefined): boolean {
  if (index == null || index < 0) return false;
  return index < DISCOVER_EAGER_THUMB_COUNT;
}

/** Overlay / content-visibility sonrası lazy img tetikleyici */
export function nudgeLazyLoadMedia(): void {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });
  });
}
