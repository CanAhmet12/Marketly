import type {
  CommodityFundamentalsInsight,
  CommodityFundamentalsResponse,
  CommodityFundamentalsSlice,
} from "@/features/markets/commodities/lib/commodity-detail-types";
import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
import {
  commodityNameFor,
  unitForCommoditySymbol,
} from "@/features/markets/commodities/lib/commodity-symbol-meta";

type FundamentalsTemplate = {
  supplyStock: string;
  supplyStockSub: string;
  seasonalWindow: string;
  seasonalSub: string;
  capacityUtilPct: number;
  capacityLabel: string;
  supplyPressure: "low" | "medium" | "high";
  inventoryChange30dPct: number;
  slices: CommodityFundamentalsSlice[];
  stats: CommodityFundamentalsResponse["stats"];
  insights: CommodityFundamentalsInsight[];
};

const GOLD: FundamentalsTemplate = {
  supplyStock: "264 Moz",
  supplyStockSub: "COMEX kayıtlı stok",
  seasonalWindow: "Q4 talep piki",
  seasonalSub: "Kuyumculuk + ETF akışı",
  capacityUtilPct: 72,
  capacityLabel: "Rafineri kapasitesi",
  supplyPressure: "low",
  inventoryChange30dPct: -1.8,
  slices: [
    { key: "stock", label: "Stok", pct: 44 },
    { key: "production", label: "Üretim", pct: 36 },
    { key: "seasonal", label: "Mevsimsel", pct: 20 },
  ],
  stats: {
    weeklyDraw: "-0.4 Moz",
    daysCover: "18 gün",
    productionTrend: "Stabil",
    harvestWindow: "—",
  },
  insights: [
    {
      id: "gold-season",
      title: "Q4 talep penceresi",
      detail: "Festival ve yıl sonu hedging talebi tipik olarak Aralık'ta zirve yapar.",
      metricLabel: "Mevsim",
      metricValue: "Q4",
      severity: "medium",
    },
    {
      id: "gold-stock",
      title: "COMEX stokları",
      detail: "Kayıtlı stoklar son 4 haftada hafif geriledi; fiziki talep destekliyor.",
      metricLabel: "Stok",
      metricValue: "264 Moz",
      severity: "low",
    },
  ],
};

const ENERGY: FundamentalsTemplate = {
  supplyStock: "448M bbl",
  supplyStockSub: "ABD ticari stok",
  seasonalWindow: "Yaz sürüş sezonu",
  seasonalSub: "Benzin talebi May–Ağustos",
  capacityUtilPct: 84,
  capacityLabel: "OPEC+ kapasite",
  supplyPressure: "medium",
  inventoryChange30dPct: 2.4,
  slices: [
    { key: "stock", label: "Envanter", pct: 48 },
    { key: "production", label: "Üretim", pct: 34 },
    { key: "seasonal", label: "Mevsimsel", pct: 18 },
  ],
  stats: {
    weeklyDraw: "+3.2M bbl",
    daysCover: "27 gün",
    productionTrend: "Kısıtlı artış",
    harvestWindow: "—",
  },
  insights: [
    {
      id: "opec-cap",
      title: "OPEC+ kapasite disiplini",
      detail: "Frekans artışı gölgesinde arz yönetimi fiyat tabanını destekliyor.",
      metricLabel: "Kapasite",
      metricValue: "84%",
      severity: "medium",
    },
    {
      id: "wti-brent",
      title: "WTI–Brent spread",
      detail: "Spread daraldığında ABD ihracat rekabet gücü azalır.",
      metricLabel: "Spread",
      metricValue: "±$3/bbl",
      severity: "low",
    },
  ],
};

const AGRICULTURE: FundamentalsTemplate = {
  supplyStock: "612M bu",
  supplyStockSub: "Küresel stok/use oranı",
  seasonalWindow: "Hasat penceresi",
  seasonalSub: "Kuzey yarımküre Eyl–Kas",
  capacityUtilPct: 68,
  capacityLabel: "Ekim alanı kullanımı",
  supplyPressure: "high",
  inventoryChange30dPct: -4.2,
  slices: [
    { key: "stock", label: "Stok", pct: 38 },
    { key: "production", label: "Hasat", pct: 42 },
    { key: "seasonal", label: "Mevsimsel", pct: 20 },
  ],
  stats: {
    weeklyDraw: "-8M bu",
    daysCover: "42 gün",
    productionTrend: "Hasat yoğun",
    harvestWindow: "Eyl–Kas",
  },
  insights: [
    {
      id: "harvest",
      title: "Hasat ilerlemesi",
      detail: "Ana hasat penceresinde arz artışı kısa vadeli baskı yaratabilir.",
      metricLabel: "Hasat",
      metricValue: "Aktif",
      severity: "high",
    },
    {
      id: "weather",
      title: "Hava riski",
      detail: "Kuraklık ve don riski primi destekleyebilir.",
      metricLabel: "Risk",
      metricValue: "Orta",
      severity: "medium",
    },
  ],
};

const INDUSTRIAL: FundamentalsTemplate = {
  supplyStock: "128 kt",
  supplyStockSub: "LME kayıtlı stok",
  seasonalWindow: "İnşaat sezonu",
  seasonalSub: "Kuzey yarımküre Nis–Eki",
  capacityUtilPct: 76,
  capacityLabel: "Smelter kapasitesi",
  supplyPressure: "medium",
  inventoryChange30dPct: 0.8,
  slices: [
    { key: "stock", label: "Stok", pct: 40 },
    { key: "production", label: "Üretim", pct: 40 },
    { key: "seasonal", label: "Mevsimsel", pct: 20 },
  ],
  stats: {
    weeklyDraw: "-2.1 kt",
    daysCover: "11 gün",
    productionTrend: "Çin odaklı",
    harvestWindow: "—",
  },
  insights: [
    {
      id: "china-demand",
      title: "Çin talep görünümü",
      detail: "Altyapı paketleri endüstri metal talebini destekleyebilir.",
      metricLabel: "Talep",
      metricValue: "Ilımlı+",
      severity: "medium",
    },
  ],
};

function templateFor(symbol: string): FundamentalsTemplate {
  const sym = symbol.trim().toUpperCase();
  if (sym.includes("XAU") || sym.includes("XAG") || sym.includes("PLAT") || sym.includes("PALL")) {
    return GOLD;
  }
  if (sym.includes("WTI") || sym.includes("BRENT") || sym.includes("NG") || sym.includes("GAS")) {
    return ENERGY;
  }
  if (
    sym.includes("WHEAT") ||
    sym.includes("CORN") ||
    sym.includes("SOY") ||
    sym.includes("COFFEE") ||
    sym.includes("SUGAR") ||
    sym.includes("COTTON") ||
    sym.includes("COCOA")
  ) {
    return AGRICULTURE;
  }
  const cat = resolveCommodityCategory(sym);
  if (cat === "degerli-metal") return GOLD;
  if (cat === "enerji") return ENERGY;
  if (cat === "tarim") return AGRICULTURE;
  return INDUSTRIAL;
}

export function buildCommodityFundamentals(symbol: string, name?: string): CommodityFundamentalsResponse {
  const sym = symbol.trim().toUpperCase();
  const tpl = templateFor(sym);

  return {
    symbol: sym,
    name: commodityNameFor(sym, name),
    category: resolveCommodityCategory(sym),
    unit: unitForCommoditySymbol(sym),
    source: "reference",
    updatedAt: Date.now(),
    supplyStock: tpl.supplyStock,
    supplyStockSub: tpl.supplyStockSub,
    seasonalWindow: tpl.seasonalWindow,
    seasonalSub: tpl.seasonalSub,
    capacityUtilPct: tpl.capacityUtilPct,
    capacityLabel: tpl.capacityLabel,
    supplyPressure: tpl.supplyPressure,
    inventoryChange30dPct: tpl.inventoryChange30dPct,
    slices: tpl.slices,
    stats: tpl.stats,
    insights: tpl.insights,
  };
}
