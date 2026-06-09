/**
 * Sprint 9 — Piyasa verisi RPC doğrulama
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), "../.env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.EXPO_PUBLIC_SUPABASE_ANON?.trim();

if (!url || !anonKey) {
  console.error("FAIL | Supabase URL/anon key missing");
  process.exit(1);
}

const client = createClient(url, anonKey);

function ok(label, detail = "") {
  console.log(`OK  | ${label}${detail ? " — " + detail : ""}`);
}
function warn(label, detail = "") {
  console.log(`WARN| ${label}${detail ? " — " + detail : ""}`);
}
function fail(label, detail = "") {
  console.log(`FAIL| ${label}${detail ? " — " + detail : ""}`);
}

console.log("=== Sprint 9 Markets RPC Verification ===\n");

const hist = await client.from("asset_price_history").select("asset_id, price_date, close_price", { count: "exact" }).limit(3);
if (hist.error) fail("asset_price_history", hist.error.message);
else ok("asset_price_history", `${hist.count ?? 0} rows`);

const seed = await client.from("assets").select("symbol").limit(1).maybeSingle();
const sym = seed.data?.symbol ?? "BTC";

const cat = await client.rpc("get_asset_category", { p_symbol: sym });
if (cat.error) fail("get_asset_category", cat.error.message);
else ok("get_asset_category", `${sym} → ${cat.data ?? "null"}`);

const spark = await client.rpc("get_asset_sparkline", { p_symbol: sym, p_days: 7 });
if (spark.error) fail("get_asset_sparkline", spark.error.message);
else {
  const n = spark.data?.length ?? 0;
  const src = spark.data?.[0]?.source ?? "—";
  ok("get_asset_sparkline", `${n} points · source=${src}`);
}

const corr = await client.rpc("get_correlated_assets", {
  p_symbol: sym,
  p_limit: 5,
  p_window_days: 90,
});
if (corr.error) fail("get_correlated_assets", corr.error.message);
else {
  const n = corr.data?.length ?? 0;
  const sample = corr.data?.[0];
  ok(
    "get_correlated_assets",
    n ? `${n} pairs · top=${sample?.symbol} r=${sample?.correlation}` : "0 pairs (cold start — history yetersiz)",
  );
}

const regress = await client.rpc("get_signals_feed", {
  p_limit: 2,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
if (regress.error) fail("regression get_signals_feed", regress.error.message);
else ok("regression get_signals_feed", `${regress.data?.length ?? 0} rows`);

console.log("\n=== Done ===");
