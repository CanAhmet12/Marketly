/**
 * Sprint 8 — Collaborative Filtering RPC doğrulama
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

async function countTable(table) {
  const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) return { error: error.message, count: null };
  return { count: count ?? 0 };
}

console.log("=== Sprint 8 CF RPC Verification ===\n");

// 1. Tablolar
const interactions = await countTable("user_signal_interactions");
if (interactions.error) fail("user_signal_interactions", interactions.error);
else ok("user_signal_interactions", `${interactions.count} rows`);

// 2. MV — doğrudan select (anon erişim varsa)
const mv = await client.from("signal_recommendations").select("for_user, signal_id, relevance_score", { count: "exact" }).limit(3);
if (mv.error) warn("signal_recommendations MV", mv.error.message);
else ok("signal_recommendations MV", `${mv.count ?? mv.data?.length ?? 0} rows (sample ${mv.data?.length ?? 0})`);

// 3. refresh_signal_recommendations
const refresh = await client.rpc("refresh_signal_recommendations");
if (refresh.error) fail("refresh_signal_recommendations", refresh.error.message);
else ok("refresh_signal_recommendations");

// 4. get_signal_recommendations (anon — affinity fallback)
const sigAnon = await client.rpc("get_signal_recommendations", { p_user_id: null, p_limit: 5 });
if (sigAnon.error) fail("get_signal_recommendations (anon)", sigAnon.error.message);
else {
  const n = sigAnon.data?.length ?? 0;
  const sample = sigAnon.data?.[0];
  ok("get_signal_recommendations (anon)", `${n} rows${sample ? ` · ${sample.asset_symbol} score=${sample.relevance_score}` : ""}`);
}

// 5. get_signal_recommendations (seed user if any interaction exists)
const seedUser = await client
  .from("user_signal_interactions")
  .select("user_id")
  .limit(1)
  .maybeSingle();
if (seedUser.data?.user_id) {
  const sigUser = await client.rpc("get_signal_recommendations", {
    p_user_id: seedUser.data.user_id,
    p_limit: 5,
  });
  if (sigUser.error) fail("get_signal_recommendations (user)", sigUser.error.message);
  else {
    const n = sigUser.data?.length ?? 0;
    const reason = sigUser.data?.[0]?.reason ?? "—";
    ok("get_signal_recommendations (user)", `${n} rows · reason: ${reason}`);
  }
} else {
  warn("get_signal_recommendations (user)", "no interactions yet — CF cold start");
}

// 6. get_creator_recommendations
const followSeed = await client.from("follows").select("follower_id").limit(1).maybeSingle();
if (followSeed.data?.follower_id) {
  const creators = await client.rpc("get_creator_recommendations", {
    p_user_id: followSeed.data.follower_id,
    p_limit: 5,
  });
  if (creators.error) fail("get_creator_recommendations", creators.error.message);
  else {
    const n = creators.data?.length ?? 0;
    const sample = creators.data?.[0];
    ok("get_creator_recommendations", `${n} rows${sample ? ` · @${sample.username ?? sample.creator_id}` : ""}`);
  }
} else {
  warn("get_creator_recommendations", "no follows seed — skipped");
}

// 7. log_signal_interaction — mevcut sinyal ile
const signalSeed = await client.from("signals").select("id").eq("is_active", true).limit(1).maybeSingle();
if (signalSeed.data?.id) {
  const log = await client.rpc("log_signal_interaction", {
    p_signal_id: signalSeed.data.id,
    p_action: "view",
  });
  if (log.error) fail("log_signal_interaction", log.error.message);
  else ok("log_signal_interaction", `signal=${signalSeed.data.id.slice(0, 8)}…`);
} else {
  warn("log_signal_interaction", "no active signal — skipped");
}

// 8. Regression — önceki sprint RPC'leri
const regress = [
  ["get_signals_feed", { p_limit: 3, p_sort: "trending", p_asset: null, p_direction: null, p_user_id: null }],
  ["refresh_all_materialized_views", {}],
];
for (const [fn, args] of regress) {
  const r = await client.rpc(fn, args);
  if (r.error) fail(`regression ${fn}`, r.error.message);
  else ok(`regression ${fn}`, fn === "get_signals_feed" ? `${r.data?.length ?? 0} rows` : "ok");
}

console.log("\n=== Done ===");
