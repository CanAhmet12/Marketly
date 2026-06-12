/** Hangi widget zonları canlı veriyle dolduruldu (mock false). */
export type LiveCategoryZones = {
  pulse: boolean;
  regime: boolean;
  segments: boolean;
  panels: boolean;
  movers: boolean;
  screener: boolean;
  signals: boolean;
  bottomStrip: boolean;
  /** Faz 5 — piyasa değeri treemap */
  treemap: boolean;
  /** Faz 5 — sinyal + mover istihbarat şeridi */
  intelDeck: boolean;
};

export const LIVE_ZONES_ALL: LiveCategoryZones = {
  pulse: true,
  regime: true,
  segments: true,
  panels: true,
  movers: true,
  screener: true,
  signals: true,
  bottomStrip: true,
  treemap: true,
  intelDeck: true,
};

export const LIVE_ZONES_NONE: LiveCategoryZones = {
  pulse: false,
  regime: false,
  segments: false,
  panels: false,
  movers: false,
  screener: false,
  signals: false,
  bottomStrip: false,
  treemap: false,
  intelDeck: false,
};

export type LiveCategoryBuildResult<T> = {
  dashboard: T;
  zones: LiveCategoryZones;
};
