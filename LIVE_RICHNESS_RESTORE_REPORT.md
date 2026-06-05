# LIVE RICHNESS RESTORE REPORT

**Sprint:** SPRINT A — Live Richness Restore  
**Tarih:** 5 Haziran 2026  
**Önceki:** `FULL_WEB_LIVE_REGRESSION_AUDIT_REPORT.md`  
**Kapsam:** WEB only — mock false zenginlik restore

---

## Executive Summary

Audit'te `WEB_MAPPER_ENOUGH` olarak işaretlenen 5 P1 alan restore edildi. Tüm mapper'lar mevcut Supabase tablolarından (`asset_prices`, `assets`, `signals`, `market_news`, `portfolio_holdings`, `playlists`, `playlist_items`, `posts`, `profiles`) türetiliyor. Mock import/fallback production path'e bağlanmadı.

| Kontrol | Sonuç |
|---------|-------|
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ |
| Yeni RPC/tablo/SQL | ❌ |
| Mock production sızıntısı | ✅ Yok |
| APP değişikliği | ❌ |

# Final Decision: `DEPLOYED`

---

## 1. Asset Symbol Detail Restore

**Sorun:** `getAssetIntelligenceBundle` → empty shell; placeholder metinler ("Canlı katman kapalı").

**Çözüm:**
- `build-asset-intelligence-from-live.ts` — fiyat, sinyal, haber, hero intel, stats, related network
- `use-asset-intelligence.ts` — mock/live birleşik hook
- `market-symbol-page-client.tsx` — hook entegrasyonu

**Live kaynaklar:** `asset_prices`+`assets`, `signals`, `market_news`

**Restore edilen widgetlar:** hero intel, signal summary/hub, top analysts, stats, news strip, symbol consensus, market signal intel, related creators/network, discussion timeline (sinyalden)

**Hâlâ boş (bilinçli):** mock-only discussions/media/thesis threads

---

## 2. Watchlist Intelligence Restore

**Sorun:** `getWatchlistIntelligenceBundle` → empty counts; sidebar fakir.

**Çözüm:**
- `build-watchlist-intelligence-from-live.ts`
- `use-watchlist-intelligence.ts`
- `build-personalized-signal-relevance.ts` (mock import yok, signals/lib)
- `watchlist-page-client.tsx` — live intel + personalized signals

**Restore edilen widgetlar:** movers, signal pulse, creator pulse, discussion feed, volatility, personal context, network narrative, onboarding (global assets varsa)

---

## 3. Playlist Detail Restore

**Sorun:** `getPlaylistDetail` → `null`; Studio→playlist loop kırık.

**Çözüm:**
- `fetch-playlist-detail.ts` — `playlists` + `playlist_items` + `posts` + `profiles`
- `build-playlist-detail-from-live.ts`
- `use-playlist-detail.ts`
- `playlist-page-client.tsx` — hook entegrasyonu

**Restore edilen widgetlar:** title, owner, member rows, intelligence pills, integration links, structure kind, continuation summary

**Hâlâ boş:** discovery_rows (öneri listesi — post-beta)

---

## 4. Discover Error UX Fix

**Sorun:** Hata banner "Örnek içerik gösteriliyor" — live'da yanıltıcı (MC-001/002 VR fallback kapalı).

**Çözüm:** Copy güncellendi:
- `discover-vertical-page-shell.tsx`
- `discover-visual-reference-surface.tsx`

**Yeni metin:** "İçerik şu an görüntülenemiyor" / "içerik boş veya geçici olarak kullanılamıyor"

---

## 5. Portfolio Live Richness Restore

**Sorun:** Live mod minimal liste; mock zengin `pf-canvas` UI kayıp.

**Çözüm:**
- `build-portfolio-intelligence-from-live.ts` — holdings, risk, strategy mix, analyst overlap
- `portfolio-page-client.tsx` — tam canvas UI (hero, chart, donut, risk, signals)

**Live kaynaklar:** `portfolio_holdings`, `asset_prices`, `signals`

**Restore edilen widgetlar:** hero stats, performance chart (derived), holdings table, allocation donut, strategy mix, risk panel, analyst overlap, portfolio signals

---

## Değişen Dosyalar

### Yeni (10)
| Dosya | Rol |
|-------|-----|
| `lib/live-richness/build-asset-intelligence-from-live.ts` | Asset intel mapper |
| `lib/live-richness/build-watchlist-intelligence-from-live.ts` | Watchlist intel mapper |
| `lib/live-richness/build-portfolio-intelligence-from-live.ts` | Portfolio intel mapper |
| `hooks/use-asset-intelligence.ts` | Asset hook |
| `hooks/use-watchlist-intelligence.ts` | Watchlist hook |
| `playlists/fetch-playlist-detail.ts` | Playlist fetch |
| `playlists/lib/build-playlist-detail-from-live.ts` | Playlist mapper |
| `playlists/hooks/use-playlist-detail.ts` | Playlist hook |
| `signals/lib/build-personalized-signal-relevance.ts` | Shared relevance (no mock) |

### Güncellenen (7)
| Dosya |
|-------|
| `market-symbol-page-client.tsx` |
| `watchlist-page-client.tsx` |
| `portfolio-page-client.tsx` |
| `playlist-page-client.tsx` |
| `discover-vertical-page-shell.tsx` |
| `discover-visual-reference-surface.tsx` |
| `lib/query-keys.ts` |

---

## Mock Davranışı

| Mod | Davranış |
|-----|----------|
| Mock true | Değişmedi — repository mock path |
| Mock false | Yeni mapper + fetch hook path |

---

## Production Deploy

✅ **5 Haziran 2026** — `dpl_8R2HXibUjT8JRkb1xuVC93bfPV86`  
**URL:** https://web-iota-three-b9kxiudy28.vercel.app

```bash
cd web && npx vercel deploy --prod --yes
```

**Smoke test:**
- `/markets/BTC` → hero intel, signal strip dolu (DB'de veri varsa)
- `/watchlist` → movers + signal pulse
- `/playlist/[id]` → member rows (playlist_items varsa)
- `/portfolio` → pf-canvas zengin UI
- `/discover` feed error → yeni copy (örnek içerik yok)

---

*SPRINT A tamamlandı. SPRINT B (home rails, settings intel) sonraki oturum.*
