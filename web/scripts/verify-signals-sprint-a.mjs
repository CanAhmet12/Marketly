/**
 * Sprint A doğrulama — sinyal feed + RPC + aktif veri
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

console.log("=== Signals Sprint A Verification ===\n");

const active = await client.from("signals").select("id", { count: "exact", head: true }).eq("is_active", true);
if (active.error) fail("active signals count", active.error.message);
else if ((active.count ?? 0) < 8) fail("active signals", `count=${active.count} (hedef ≥8)`);
else ok("active signals", String(active.count));

const results = await client.from("signals").select("result").not("result", "is", null);
const vals = [...new Set((results.data ?? []).map((r) => r.result))];
if (vals.some((v) => v === "win" || v === "loss")) warn("result enum", `hâlâ win/loss: ${vals.join(", ")}`);
else ok("result enum", vals.join(", ") || "—");

const feed = await client.rpc("get_signals_feed", {
  p_limit: 10,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
if (feed.error) fail("get_signals_feed", feed.error.message);
else if ((feed.data?.length ?? 0) < 5) fail("get_signals_feed", `${feed.data?.length ?? 0} rows (hedef ≥5)`);
else ok("get_signals_feed", `${feed.data.length} rows · top=${feed.data[0]?.asset_symbol}`);

const copies = await client.from("signal_copies").select("user_id", { count: "exact", head: true });
if (copies.error) fail("signal_copies", copies.error.message);
else if ((copies.count ?? 0) === 0) warn("signal_copies", "0 rows — follows backfill yetersiz olabilir");
else ok("signal_copies", String(copies.count));

const copyRpc = await client.rpc("copy_signal_once", {
  p_user_id: "c1111111-1111-1111-1111-111111111111",
  p_signal_id: feed.data?.[0]?.id ?? "00000000-0000-0000-0000-000000000001",
});
if (copyRpc.error?.code === "PGRST202") fail("copy_signal_once RPC", "yok — P0_SIGNALS_SPRINT_A.sql çalıştır");
else if (copyRpc.error) warn("copy_signal_once", copyRpc.error.message);
else ok("copy_signal_once", JSON.stringify(copyRpc.data));

const likeRpc = await client.rpc("toggle_signal_like", {
  p_user_id: "c1111111-1111-1111-1111-111111111111",
  p_signal_id: feed.data?.[0]?.id ?? "00000000-0000-0000-0000-000000000001",
});
if (likeRpc.error?.code === "PGRST202") fail("toggle_signal_like RPC", "yok — P0_SIGNALS_SPRINT_A.sql çalıştır");
else if (likeRpc.error) warn("toggle_signal_like", likeRpc.error.message);
else ok("toggle_signal_like", JSON.stringify(likeRpc.data));

const markets = await client.from("signals").select("asset_id").eq("is_active", true);
const assets = [...new Set((markets.data ?? []).map((r) => r.asset_id))];
ok("active asset diversity", assets.join(", "));

console.log("\n=== Done ===");
const failed = (active.count ?? 0) < 8 || feed.error || (feed.data?.length ?? 0) < 5;
process.exit(failed ? 1 : 0);
