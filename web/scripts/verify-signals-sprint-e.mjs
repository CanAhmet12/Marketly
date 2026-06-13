/**
 * Sprint E doğrulama — get_signal_by_id + CF refresh
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

console.log("=== Signals Sprint E Verification ===\n");

const feed = await client.rpc("get_signals_feed", {
  p_limit: 1,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});
const activeId = feed.data?.[0]?.id;

const archived = await client
  .from("signals")
  .select("id, asset_id, is_active, result")
  .eq("is_active", false)
  .limit(1)
  .maybeSingle();

const testId = archived.data?.id ?? activeId;
if (!testId) fail("test signal", "bulunamadı");
else {
  const byId = await client.rpc("get_signal_by_id", { p_signal_id: testId, p_user_id: null });
  if (byId.error?.code === "PGRST202") fail("get_signal_by_id", "RPC yok — P0_SIGNALS_SPRINT_E.sql çalıştır");
  else if (byId.error) fail("get_signal_by_id", byId.error.message);
  else if (!byId.data?.length) fail("get_signal_by_id", "boş");
  else {
    const r = byId.data[0];
    ok("get_signal_by_id", `${r.asset_symbol} · active=${r.is_active} · result=${r.result ?? "—"}`);
  }
}

const recs = await client.rpc("get_signal_recommendations", { p_user_id: null, p_limit: 5 });
if (recs.error?.code === "PGRST202") warn("get_signal_recommendations", "RPC/MV yok");
else if (recs.error) warn("get_signal_recommendations", recs.error.message);
else ok("get_signal_recommendations", `${recs.data?.length ?? 0} rows`);

console.log("\n=== Done ===");
const failed = feed.error || (testId && (await client.rpc("get_signal_by_id", { p_signal_id: testId, p_user_id: null })).error?.code === "PGRST202");
process.exit(failed ? 1 : 0);
