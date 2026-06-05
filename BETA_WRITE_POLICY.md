# BETA WRITE POLICY

**Proje:** Marketly WEB (kapalı beta)  
**Tarih:** 5 Haziran 2026  
**Kontrol mekanizması:** `NEXT_PUBLIC_WEB_WRITE_ENABLED` + Supabase RLS

---

## Varsayılan

| Ortam | `NEXT_PUBLIC_USE_MOCK` | `NEXT_PUBLIC_WEB_WRITE_ENABLED` |
|-------|------------------------|----------------------------------|
| Production preview | `false` | `false` (salt okuma) |
| **Kapalı beta** | `false` | **`true`** |
| Local mock dev | `true` | ignored (mock writes) |

Kaynak: `web/lib/supabase/write-guard.ts`

---

## Write path kararları

| Path | Modül | Beta | Gerekçe |
|------|-------|------|---------|
| Post upload | `insert-upload-post.ts`, `storage-upload.ts` | **ALLOW_IN_BETA** | Çekirdek creator akışı; RLS `posts` user_id |
| Signal upload | `insert-signal.ts` | **ALLOW_IN_BETA** | Çekirdek ürün; RLS `signals` |
| Post comment | `fetch-post-comments.ts` | **ALLOW_IN_BETA** | Sosyal etkileşim; RLS user_id |
| Video comment | `fetch-video-comments.ts` | **ALLOW_IN_BETA** | Watch etkileşimi |
| Follow / unfollow | `fetch-follow.ts` | **ALLOW_IN_BETA** | Kanal takibi |
| Like / save post | `post-like-save.ts` | **ALLOW_IN_BETA** | Engagement |
| Settings save | `use-settings-preferences.ts` | **ALLOW_IN_BETA** | Profil tercihleri |
| DM send | `fetch-conversations.ts` | **ALLOW_IN_BETA** | Mesajlaşma |
| Live chat send | `fetch-live-messages.ts` | **ALLOW_IN_BETA** | Canlı yayın |
| Studio edit | `studio-content-edit-client.tsx` | **ALLOW_IN_BETA** | İçerik düzenleme |
| Story upload | `upload-story.ts` | **ALLOW_IN_BETA** | Stories rail |
| **Watchlist toggle** | `use-markets-watchlist.ts` → `fetch-watchlist.ts` | **ALLOW_IN_BETA** | Write-gate **yok**; RLS `watchlists` user_id korur |
| **Price alert delete** | `fetch-price-alerts.ts` | **ALLOW_IN_BETA** | Write-gate **yok**; RLS `price_alerts` user_id |
| **Price alert create** | alerts UI | **REVIEW_FIRST** | Create path write-gate kontrolü sprint dışı — beta öncesi manuel test |
| Live viewer increment | `fetch-live-messages.ts` | **ALLOW_IN_BETA** | RPC `increment_viewers`; düşük risk |
| Account delete | edge `delete-account` | **KEEP_BLOCKED** | Beta dışı; ayrı onay |

---

## Beta deploy env örneği

```env
NEXT_PUBLIC_SUPABASE_URL=https://ufljsnqxvqzichwlpfgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_WEB_WRITE_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://<beta-host>
# Opsiyonel canlı yayın:
NEXT_PUBLIC_AGORA_APP_ID=<app_id>
```

**Asla client'a ekleme:** `SUPABASE_SERVICE_ROLE_KEY`, `NEWS_API_KEY`, `OPENAI_API_KEY`

---

## Rollback

Beta sorununda yazmaları anında kapat:

```env
NEXT_PUBLIC_WEB_WRITE_ENABLED=false
```

Redeploy gerekir. Okuma akışları etkilenmez.

---

## Manuel doğrulama (beta açılış günü)

1. Login → `/upload` post oluştur → `posts` tablosunda görünür
2. `/signals` upload → `signals` insert
3. Post beğen / kaydet → `post_likes` / `saved_posts`
4. `/settings` kaydet → profil güncellenir
5. `/watchlist` sembol ekle → `watchlists` (auth user)
6. Write flag `false` iken aynı aksiyonlar → `WEB_WRITE_BLOCKED_MESSAGE` veya sessiz no-op (watchlist localStorage)
