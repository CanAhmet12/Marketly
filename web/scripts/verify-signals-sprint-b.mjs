/**
 * Sprint B doğrulama — sparkline, thread pack, RPC filtreleri
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
function fail(label, detail = "") {
  console.log(`FAIL| ${label}${detail ? " — " + detail : ""}`);
}
function warn(label, detail = "") {
  console.log(`WARN| ${label}${detail ? " — " + detail : ""}`);
}

console.log("=== Signals Sprint B Verification ===\n");

const feed = await client.rpc("get_signals_feed", {
  p_limit: 5,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
if (feed.error) fail("get_signals_feed", feed.error.message);
else if ((feed.data?.length ?? 0) < 1) fail("get_signals_feed", "boş");
else ok("get_signals_feed", `${feed.data.length} rows`);

const top = feed.data?.[0];
const sym = top?.asset_symbol ?? top?.asset_id ?? "BTC";

const spark = await client.rpc("get_asset_sparkline", { p_symbol: sym, p_days: 7 });
if (spark.error?.code === "PGRST202") fail("get_asset_sparkline", "RPC yok — P0_ALGO_SPRINT9_MARKETS.sql");
else if (spark.error) fail("get_asset_sparkline", spark.error.message);
else if ((spark.data?.length ?? 0) < 2) warn("get_asset_sparkline", `${sym}: ${spark.data?.length ?? 0} points`);
else {
  const src = spark.data[0]?.source ?? "?";
  ok("get_asset_sparkline", `${sym}: ${spark.data.length} points · source=${src}`);
}

let packError = null;
if (top?.id) {
  const pack = await client.rpc("get_signal_thread_pack", { p_signal_id: top.id });
  if (pack.error?.code === "PGRST202") {
    fail("get_signal_thread_pack", "RPC yok");
    packError = pack.error;
  } else if (pack.error) fail("get_signal_thread_pack", pack.error.message);
  else if (!pack.data?.signal_id) warn("get_signal_thread_pack", "boş JSON");
  else ok("get_signal_thread_pack", `copies_24h=${pack.data.copies_24h ?? 0} · likes=${pack.data.likes_count ?? 0}`);
}

const buyFeed = await client.rpc("get_signals_feed", {
  p_limit: 10,
  p_sort: "new",
  p_asset: null,
  p_direction: "BUY",
  p_user_id: null,
});
if (buyFeed.error) fail("get_signals_feed BUY filter", buyFeed.error.message);
else {
  const allBuy = (buyFeed.data ?? []).every((r) => r.direction === "BUY");
  if (!allBuy && (buyFeed.data?.length ?? 0) > 0) warn("p_direction=BUY", "karışık yön");
  else ok("p_direction=BUY", `${buyFeed.data?.length ?? 0} rows`);
}

if (sym) {
  const assetFeed = await client.rpc("get_signals_feed", {
    p_limit: 10,
    p_sort: "trending",
    p_asset: sym,
    p_direction: null,
    p_user_id: null,
  });
  if (assetFeed.error) fail("get_signals_feed asset filter", assetFeed.error.message);
  else ok(`p_asset=${sym}`, `${assetFeed.data?.length ?? 0} rows`);
}

console.log("\n=== Done ===");
const failed =
  feed.error ||
  spark.error?.code === "PGRST202" ||
  packError?.code === "PGRST202";
process.exit(failed ? 1 : 0);
