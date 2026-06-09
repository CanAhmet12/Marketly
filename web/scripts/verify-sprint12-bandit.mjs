/**
 * Sprint 12 — Bandit / A/B RPC doğrulama
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

console.log("=== Sprint 12 Bandit RPC Verification ===\n");

const tbl = await client.from("algorithm_experiments").select("id", { count: "exact", head: true });
if (tbl.error) fail("algorithm_experiments", tbl.error.message);
else ok("algorithm_experiments", `${tbl.count ?? 0} rows`);

const log = await client.rpc("log_algorithm_experiment", {
  p_experiment_id: "discoverRanking",
  p_variant: "treatment",
  p_metric: "impression",
  p_value: 1,
  p_meta: { source: "verify_script" },
});
if (log.error) fail("log_algorithm_experiment", log.error.message);
else ok("log_algorithm_experiment", `id=${log.data?.slice?.(0, 8) ?? log.data}`);

const summary = await client.rpc("get_algorithm_experiment_summary", {
  p_experiment_id: "discoverRanking",
  p_days: 7,
});
if (summary.error) fail("get_algorithm_experiment_summary", summary.error.message);
else ok("get_algorithm_experiment_summary", `${summary.data?.length ?? 0} metric rows`);

const refresh = await client.rpc("refresh_algorithm_bandit_weights", { p_days: 7 });
if (refresh.error) fail("refresh_algorithm_bandit_weights", refresh.error.message);
else ok("refresh_algorithm_bandit_weights", `${refresh.data ?? 0} weights updated`);

const weights = await client.from("algorithm_bandit_weights").select("experiment_id, variant, weight").limit(3);
if (weights.error) fail("algorithm_bandit_weights", weights.error.message);
else ok("algorithm_bandit_weights", `${weights.data?.length ?? 0} rows`);

console.log("\n=== Done ===");
