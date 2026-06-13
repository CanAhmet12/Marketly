/**
 * BÖLÜM 2 doğrulama — RPC algoritma, canlı, kişiselleştirme, rising_velocity
 * Önce: db/P0_CREATORS_BOLUM2_RPC_ALGORITHM.sql Supabase'de çalıştırılmalı
 * Kullanım: cd web && node scripts/verify-bolum2-rpc-algorithm.mjs
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

let pass = 0;
let fail = 0;
let warn = 0;

function ok(label, detail = "") {
  pass++;
  console.log(`✅ ${label}${detail ? ` — ${detail}` : ""}`);
}
function bad(label, detail = "") {
  fail++;
  console.log(`❌ ${label}${detail ? ` — ${detail}` : ""}`);
}
function note(label, detail = "") {
  warn++;
  console.log(`⚠️  ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("═".repeat(60));
console.log("BÖLÜM 2 — RPC & Algoritma Doğrulama");
console.log("═".repeat(60));

// 1) get_creators_directory — canlı + medya önizleme
const dir = await client.rpc("get_creators_directory", { p_limit: 48, p_sort: "live_first" });
if (dir.error) {
  bad("get_creators_directory", dir.error.message);
} else {
  const rows = dir.data ?? [];
  const live = rows.filter((r) => r.is_live);
  const withThumb = rows.filter((r) => r.latest_thumbnail || r.live_thumbnail);
  const withContent = rows.filter((r) => r.latest_title || r.latest_content);

  if (live.length > 0) {
    ok("canlı yayın (live_sessions)", `${live.length} analist — ${live.map((r) => r.username).join(", ")}`);
  } else {
    bad("canlı yayın", "is_live=0 — demo live_sessions seed çalışmamış");
  }

  if (withThumb.length > 0) {
    ok("medya önizleme", `${withThumb.length}/${rows.length} thumbnail`);
  } else {
    note("medya önizleme", "thumbnail hâlâ az");
  }

  if (withContent.length > 0) {
    ok("içerik başlığı", `${withContent.length}/${rows.length} headline`);
  } else {
    bad("içerik başlığı", "latest_title/content boş");
  }

  const rising = rows.filter((r) => (r.rising_velocity ?? 0) > 0);
  if (rising.length > 0) {
    ok("rising_velocity", `${rising.length} analist momentumlu`);
  } else {
    bad("rising_velocity", "hâlâ 0 — signal_copies penceresi veya mv refresh kontrol et");
  }

  const scored = rows.filter((r) => (r.composite_score ?? 0) > 0);
  ok("composite_score", `${scored.length}/${rows.length} skorlu`);
}

// 2) get_creator_recommendations — fallback
const follows = await client.from("follows").select("follower_id, following_id");
const testUser = follows.data?.find((f) => {
  const count = follows.data.filter((x) => x.follower_id === f.follower_id).length;
  return count >= 2;
})?.follower_id;

if (testUser) {
  const rec = await client.rpc("get_creator_recommendations", {
    p_user_id: testUser,
    p_limit: 8,
  });
  if (rec.error) {
    bad("get_creator_recommendations", rec.error.message);
  } else if ((rec.data?.length ?? 0) > 0) {
    ok("kişiselleştirme fallback", `${rec.data.length} öneri — @${rec.data[0].username ?? rec.data[0].creator_id}`);
  } else {
    bad("kişiselleştirme fallback", "0 öneri — affinity/leaderboard devreye girmemiş");
  }
} else {
  note("kişiselleştirme", "test kullanıcısı bulunamadı");
}

// 3) live_sessions aktif
const sessions = await client
  .from("live_sessions")
  .select("channel_name, is_active, host_id, title")
  .eq("is_active", true)
  .is("ended_at", null);
if (sessions.error) {
  bad("live_sessions", sessions.error.message);
} else if ((sessions.data?.length ?? 0) > 0) {
  ok("live_sessions aktif", `${sessions.data.length} oturum`);
} else {
  bad("live_sessions aktif", "0 oturum");
}

// 4) live_first sıralama — canlılar üstte mi?
if (dir.data?.length) {
  const firstLiveIdx = dir.data.findIndex((r) => r.is_live);
  if (firstLiveIdx === 0 || (firstLiveIdx > 0 && !dir.data[0].is_live)) {
    if (firstLiveIdx === 0) ok("live_first sıralama", "ilk satır canlı");
    else note("live_first sıralama", `canlı index=${firstLiveIdx}`);
  }
}

console.log("\n" + "═".repeat(60));
console.log(`Sonuç: ${pass} geçti, ${fail} kırık, ${warn} uyarı`);
if (fail > 0) {
  console.log("\n📝 db/P0_CREATORS_BOLUM2_RPC_ALGORITHM.sql dosyasını Supabase SQL Editor'de çalıştırın.");
  process.exit(1);
}
