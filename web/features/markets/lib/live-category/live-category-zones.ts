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
};

export type LiveCategoryBuildResult<T> = {
  dashboard: T;
  zones: LiveCategoryZones;
};
