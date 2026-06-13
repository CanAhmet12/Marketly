/**
 * Sprint F doğrulama — arşiv kapsamı + aktif/arşiv ayrımı
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

console.log("=== Signals Sprint F Verification ===\n");

const activeCount = await client
  .from("signals")
  .select("id", { count: "exact", head: true })
  .eq("is_active", true);

const archiveCount = await client
  .from("signals")
  .select("id", { count: "exact", head: true })
  .eq("is_active", false);

if (activeCount.error) fail("active count", activeCount.error.message);
else ok("active count", String(activeCount.count ?? 0));

if (archiveCount.error) fail("archive count", archiveCount.error.message);
else ok("archive count", String(archiveCount.count ?? 0));

const archived = await client
  .from("signals")
  .select("id, asset_id, is_active, result, created_at")
  .eq("is_active", false)
  .order("created_at", { ascending: false })
  .limit(5);

if (archived.error) fail("archive feed", archived.error.message);
else if (!(archived.data?.length > 0)) fail("archive feed", "boş — Sprint A arşiv bekleniyor");
else {
  const sample = archived.data[0];
  const allInactive = archived.data.every((r) => r.is_active === false);
  if (!allInactive) fail("archive feed", "aktif satır karıştı");
  else ok("archive feed", `${archived.data.length} rows · top=${sample.asset_id} · result=${sample.result ?? "—"}`);
}

const live = await client.rpc("get_signals_feed", {
  p_limit: 5,
  p_sort: "trending",
  p_asset: null,
  p_direction: null,
  p_user_id: null,
});

if (live.error) fail("live RPC feed", live.error.message);
else if (!(live.data?.length > 0)) fail("live RPC feed", "boş");
else {
  const allActive = live.data.every((r) => r.is_active !== false);
  if (!allActive) fail("live RPC feed", "arşiv satırı karıştı");
  else ok("live RPC feed", `${live.data.length} rows · top=${live.data[0]?.asset_symbol}`);
}

console.log("\n=== Done ===");
const failed =
  activeCount.error ||
  archiveCount.error ||
  archived.error ||
  !(archived.data?.length > 0) ||
  live.error ||
  !(live.data?.length > 0);
process.exit(failed ? 1 : 0);
