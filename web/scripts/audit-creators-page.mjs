/**
 * /creators sayfası — kod + Supabase gerçek veri denetimi
 * Kullanım: cd web && node scripts/audit-creators-page.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !anonKey) {
  console.error("❌ .env.local Supabase anahtarları eksik");
  process.exit(1);
}

const client = createClient(url, anonKey);

function pct(n, total) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function classifyAvatar(u) {
  if (!u || !String(u).trim()) return "empty";
  const s = String(u).trim();
  if (s.includes("ui-avatars.com")) return "ui-avatars";
  if (s.includes("pravatar.cc")) return "pravatar";
  if (s.includes("/storage/v1/object/public/")) return "supabase-storage";
  if (s.startsWith("http")) return "external-url";
  return "relative-or-unknown";
}

async function rpcCheck(name, params) {
  const { data, error } = await client.rpc(name, params);
  return {
    name,
    ok: !error,
    error: error?.message ?? null,
    code: error?.code ?? null,
    count: Array.isArray(data) ? data.length : data == null ? 0 : 1,
    sample: Array.isArray(data) ? data[0] ?? null : data,
  };
}

console.log("═".repeat(60));
console.log("CREATORS PAGE — SUPABASE AUDIT");
console.log(`URL: ${url}`);
console.log("═".repeat(60));

// ── RPC'ler ──
const rpcs = await Promise.all([
  rpcCheck("get_creators_directory", { p_limit: 48, p_sort: "recommended" }),
  rpcCheck("get_leaderboard_analysts", { p_limit: 12, p_sort: "composite" }),
  rpcCheck("get_creator_recommendations", {
    p_user_id: "a1111111-1111-1111-1111-111111111111",
    p_limit: 8,
  }),
]);

console.log("\n## 1. RPC DURUMU\n");
for (const r of rpcs) {
  const icon = r.ok ? "✅" : "❌";
  console.log(`${icon} ${r.name}: ${r.ok ? `${r.count} satır` : r.error} ${r.code ? `(${r.code})` : ""}`);
}

// ── Directory detay analizi ──
const dir = rpcs[0];
if (dir.ok && dir.count > 0) {
  const full = await client.rpc("get_creators_directory", { p_limit: 48, p_sort: "recommended" });
  const rows = full.data ?? [];

  const avatarStats = {};
  let liveCount = 0;
  let noLatest = 0;
  let noPostsButInList = 0;
  let zeroComposite = 0;
  let zeroAccuracy = 0;

  for (const row of rows) {
    const cls = classifyAvatar(row.avatar_url);
    avatarStats[cls] = (avatarStats[cls] ?? 0) + 1;
    if (row.is_live) liveCount++;
    if (!row.latest_post_id && !row.live_post_id) noLatest++;
    if ((row.post_count ?? 0) === 0 && (row.signal_count ?? 0) > 0) noPostsButInList++;
    if (!row.composite_score || row.composite_score === 0) zeroComposite++;
    if (!row.signal_accuracy || row.signal_accuracy === 0) zeroAccuracy++;
  }

  console.log("\n## 2. get_creators_directory VERİ KALİTESİ (48 limit)\n");
  console.log(`Toplam satır: ${rows.length}`);
  console.log(`Canlı (is_live=true): ${liveCount}`);
  console.log(`İçerik başlığı/görseli yok (latest+live null): ${noLatest} (${pct(noLatest, rows.length)})`);
  console.log(`Post yok ama sinyal var: ${noPostsButInList}`);
  console.log(`composite_score = 0: ${zeroComposite} (${pct(zeroComposite, rows.length)})`);
  console.log(`signal_accuracy = 0: ${zeroAccuracy} (${pct(zeroAccuracy, rows.length)})`);
  console.log("\nAvatar dağılımı:");
  for (const [k, v] of Object.entries(avatarStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${k}: ${v} (${pct(v, rows.length)})`);
  }

  const livePosts = await client.from("posts").select("id, user_id, type, title, is_live, status").eq("type", "live").limit(20);
  console.log("\n## 3. CANLI YAYIN GERÇEKLİĞİ\n");
  if (livePosts.error) {
    console.log(`❌ posts live sorgusu: ${livePosts.error.message}`);
  } else {
    const liveRows = livePosts.data ?? [];
    console.log(`posts.type='live' kayıt (ilk 20): ${liveRows.length}`);
    const withIsLive = liveRows.filter((p) => p.is_live === true).length;
    const withStatus = liveRows.filter((p) => p.status === "live" || p.status === "streaming").length;
    console.log(`  is_live=true: ${withIsLive}`);
    console.log(`  status live/streaming: ${withStatus}`);
    if (liveRows[0]) console.log(`  örnek kolonlar: ${JSON.stringify(liveRows[0])}`);
    console.log(
      `\n⚠️  RPC is_live = "en son live tipi post var mı" — gerçek yayın durumu (is_live/status) kontrol etmiyor olabilir.`,
    );
  }
}

// ── profiles tablosu ──
const profiles = await client
  .from("profiles")
  .select("id, username, avatar_url, follower_count, signal_accuracy, tier, verified")
  .limit(200);

console.log("\n## 4. profiles TABLOSU\n");
if (profiles.error) {
  console.log(`❌ ${profiles.error.message} (${profiles.error.code})`);
} else {
  const rows = profiles.data ?? [];
  const av = {};
  let nullAvatar = 0;
  for (const p of rows) {
    const cls = classifyAvatar(p.avatar_url);
    av[cls] = (av[cls] ?? 0) + 1;
    if (cls === "empty") nullAvatar++;
  }
  console.log(`Örneklenen profil: ${rows.length}`);
  console.log(`Boş avatar_url: ${nullAvatar} (${pct(nullAvatar, rows.length)})`);
  console.log("Avatar türleri:", av);
}

// ── signals tablosu ──
const signals = await client.from("signals").select("id, creator_id, result, copies_count").limit(100);
console.log("\n## 5. signals TABLOSU\n");
if (signals.error) {
  console.log(`❌ ${signals.error.message}`);
} else {
  const rows = signals.data ?? [];
  const creators = new Set(rows.map((s) => s.creator_id));
  const withResult = rows.filter((s) => s.result).length;
  console.log(`Örnek sinyal: ${rows.length}, benzersiz creator: ${creators.size}`);
  console.log(`result dolu: ${withResult} (${pct(withResult, rows.length)})`);
}

// ── follows (kişiselleştirme) ──
const follows = await client.from("follows").select("follower_id, following_id").limit(50);
console.log("\n## 6. follows (kişiselleştirme)\n");
if (follows.error) {
  console.log(`❌ ${follows.error.message} (${follows.error.code})`);
} else {
  console.log(`Örnek takip kaydı: ${follows.data?.length ?? 0}`);
}

const rec = rpcs[2];
if (rec.ok) {
  console.log(`get_creator_recommendations (seed user): ${rec.count} satır`);
  if (rec.sample) {
    console.log(`  örnek: @${rec.sample.username ?? rec.sample.creator_id}, avatar=${classifyAvatar(rec.sample.avatar_url)}`);
  }
}

// ── mv refresh / cron ──
const refreshRpc = await rpcCheck("refresh_all_materialized_views", {});
console.log("\n## 7. MATERIALIZED VIEW REFRESH\n");
console.log(
  refreshRpc.ok
    ? `✅ refresh_all_materialized_views çağrılabilir`
    : `❌ refresh_all_materialized_views: ${refreshRpc.error}`,
);

// ── RLS: anon profiles read ──
const anonProfiles = await client.from("profiles").select("id").limit(1);
console.log("\n## 8. RLS / ANON ERİŞİM\n");
console.log(anonProfiles.error ? `❌ profiles anon: ${anonProfiles.error.message}` : "✅ profiles anon okunabilir");

const followsAnon = await client.from("follows").select("follower_id").limit(1);
console.log(
  followsAnon.error ? `⚠️  follows anon: ${followsAnon.error.message}` : "✅ follows anon okunabilir",
);

console.log("\n" + "═".repeat(60));
