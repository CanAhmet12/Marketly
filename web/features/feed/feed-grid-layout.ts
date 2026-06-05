/**
 * Ana sayfa video grid — HomeFeed ve SSR skeleton ile aynı kolon kırılımları.
 * Geniş ekranda en fazla 3 kolon (daha büyük kartlar).
 */
export const HOME_FEED_GRID_CLASS =
  "grid list-none grid-cols-1 p-0 [column-gap:var(--grid-gap-x)] [row-gap:var(--grid-gap-y)] min-[640px]:grid-cols-2 min-[1024px]:grid-cols-3";
