/**
 * BÖLÜM 1 doğrulama — follower sync, signal results, copy_signal_once
 * Önce: db/P0_CREATORS_BOLUM1_DATA_INTEGRITY.sql Supabase'de çalıştırılmalı
 * Kullanım: cd web && node scripts/verify-bolum1-data-integrity.mjs
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
console.log("BÖLÜM 1 — Veri Bütünlüğü Doğrulama");
console.log("═".repeat(60));

// 1) follower_count drift
const [profiles, follows] = await Promise.all([
  client.from("profiles").select("id, username, follower_count").limit(100),
  client.from("follows").select("follower_id, following_id"),
]);

if (profiles.error) {
  bad("profiles okuma", profiles.error.message);
} else if (follows.error) {
  bad("follows okuma", follows.error.message);
} else {
  const countMap = new Map();
  for (const f of follows.data ?? []) {
    countMap.set(f.following_id, (countMap.get(f.following_id) ?? 0) + 1);
  }
  const drifts = (profiles.data ?? []).filter((p) => {
    const actual = countMap.get(p.id) ?? 0;
    return (p.follower_count ?? 0) !== actual;
  });
  if (drifts.length === 0) {
    ok("follower_count senkron", `${profiles.data?.length ?? 0} profil uyumlu`);
  } else {
    bad("follower_count drift", `${drifts.length} profil uyumsuz (SQL çalıştırılmamış olabilir)`);
    console.log("   örnek:", drifts.slice(0, 3).map((d) => `@${d.username}: kolon=${d.follower_count}, gerçek=${countMap.get(d.id) ?? 0}`).join(" | "));
  }
}

// 2) signal results
const signals = await client.from("signals").select("id, result, closed_at, is_active, copies_count, created_at");
if (signals.error) {
  bad("signals okuma", signals.error.message);
} else {
  const rows = signals.data ?? [];
  const closed = rows.filter((s) => s.result != null);
  const wins = rows.filter((s) => s.result === "win");
  const oldOpen = rows.filter((s) => !s.result && new Date(s.created_at) < new Date(Date.now() - 7 * 864e5));
  if (closed.length > 0) {
    ok("signals.result dolu", `${closed.length}/${rows.length} kapalı, ${wins.length} win`);
  } else {
    bad("signals.result boş", "Hiç kapalı sinyal yok — SQL backfill çalışmamış");
  }
  if (oldOpen.length > 0) {
    note("eski açık sinyaller", `${oldOpen.length} adet 7+ gün açık`);
  }
}

// 3) copy_signal_once RPC + çift sayaç
const testSignal = signals.data?.[0];
const testUserId = follows.data?.[0]?.follower_id ?? null;
if (testSignal && testUserId) {
  const before = testSignal.copies_count ?? 0;
  const rpc = await client.rpc("copy_signal_once", {
    p_user_id: testUserId,
    p_signal_id: testSignal.id,
  });
  if (rpc.error) {
    if (rpc.error.code === "PGRST202") {
      bad("copy_signal_once", "RPC yok");
    } else {
      note("copy_signal_once çağrısı", rpc.error.message);
    }
  } else {
    const afterRow = await client.from("signals").select("copies_count").eq("id", testSignal.id).single();
    const after = afterRow.data?.copies_count ?? before;
    const delta = after - before;
    if (rpc.data?.copied === true && delta === 1) {
      ok("copy_signal_once tek artış", `${before} → ${after}`);
    } else if (rpc.data?.copied === false && delta === 0) {
      ok("copy_signal_once idempotent", "tekrar kopya engellendi");
    } else if (delta === 2) {
      bad("copy_signal_once çift sayaç", `${before} → ${after} (+2) — trigger+RPC çakışması`);
    } else {
      note("copy_signal_once", `copied=${rpc.data?.copied}, ${before}→${after}`);
    }
  }
}

// 4) close_signal RPC varlığı (auth gerektirir — sadece varlık)
const closeProbe = await client.rpc("close_signal", {
  p_signal_id: "00000000-0000-0000-0000-000000000001",
  p_result: "win",
  p_user_id: "00000000-0000-0000-0000-000000000099",
});
if (closeProbe.error?.code === "PGRST202") {
  bad("close_signal RPC", "fonksiyon yok");
} else {
  ok("close_signal RPC", "tanımlı (auth/owner hatası beklenen)");
}

// 5) fxwizard örnek
const fx = (profiles.data ?? []).find((p) => p.username === "fxwizard");
if (fx) {
  const actual = (follows.data ?? []).filter((f) => f.following_id === fx.id).length;
  if ((fx.follower_count ?? 0) === actual) {
    ok("fxwizard follower_count", `${actual} (gerçek follows)`);
  } else {
    bad("fxwizard follower_count", `kolon=${fx.follower_count}, gerçek=${actual}`);
  }
}

// 6) directory RPC composite artışı
const dir = await client.rpc("get_creators_directory", { p_limit: 48 });
if (dir.error) {
  bad("get_creators_directory", dir.error.message);
} else {
  const withScore = (dir.data ?? []).filter((r) => (r.composite_score ?? 0) > 0).length;
  const withVel = (dir.data ?? []).filter((r) => (r.rising_velocity ?? 0) > 0).length;
  if (withScore > 0) {
    ok("directory composite_score", `${withScore} analist skorlu`);
  } else {
    note("directory composite_score", "hâlâ 0 — mv refresh veya sinyal verisi yetersiz");
  }
  if (withVel > 0) {
    ok("directory rising_velocity", `${withVel} analist momentumlu`);
  } else {
    note("directory rising_velocity", "0 — signal_copies backfill kontrol et");
  }
}

console.log("\n" + "═".repeat(60));
console.log(`Sonuç: ${pass} geçti, ${fail} kırık, ${warn} uyarı`);
if (fail > 0) {
  console.log("\n📝 db/P0_CREATORS_BOLUM1_DATA_INTEGRITY.sql dosyasını Supabase SQL Editor'de çalıştırın.");
  process.exit(1);
}
