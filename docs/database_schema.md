# database_schema.md — DB Şema Özeti

> Tam şema: `ADD_TABLES.sql` (başında idempotent `DO $$ DROP POLICY ... $$` bloğu var)

## Ana Tablolar

```sql
profiles      id(UUID) username full_name avatar_url bio tier(free|pro|elite) verified follower_count
posts         id user_id type(text|image|video|signal|live) content image_url video_url asset_tag likes comments views
signals       id creator_id asset_id direction(BUY|SELL|HOLD) entry_price target_price stop_loss status(active|success|failed) copies_count
assets        id(TEXT) symbol name category(crypto|stocks|commodities|forex) logo_url
asset_prices  asset_id price change_percent volume market_cap spark(JSONB) updated_at
```

## Sosyal Tablolar

```sql
follows          follower_id following_id  UNIQUE(follower_id, following_id)
post_likes       user_id post_id           UNIQUE(user_id, post_id)
saved_posts      user_id post_id           UNIQUE(user_id, post_id)
signal_copies    user_id signal_id         UNIQUE(user_id, signal_id)
comments         id post_id user_id content likes parent_id(reply)
video_likes      user_id video_id
saved_videos     user_id video_id
video_comments   id video_id user_id content
```

## Bildirim / Alarm

```sql
notifications  id user_id type(like|comment|follow|signal|price_alert|system) title body is_read sender_id meta(JSONB)
price_alerts   id user_id asset_id condition(above|below) target_price is_active triggered triggered_at
push_tokens    user_id token platform  UNIQUE(user_id, token)
```

## Mesajlaşma / Canlı

```sql
dm_conversations  id participant_1 participant_2 last_message  UNIQUE(p1,p2)
dm_messages       id conversation_id sender_id content is_read
live_streams      id broadcaster_id channel_name title status(active|ended) viewer_count
live_messages     id stream_id user_id username avatar_url message is_gift
stories           id user_id image_url expires_at(24h)
```

## Portföy / Diğer

```sql
portfolio_holdings   id user_id symbol quantity avg_buy_price
watchlist            user_id asset_id
analyst_subscriptions  user_id analyst_id tier
user_reports         reporter_id reported_id post_id reason
error_logs           screen message stack platform user_id
badges / user_badges rozetler
```

## Önemli DB Fonksiyonları

```sql
toggle_post_like(p_post_id)       -- atomic like toggle
toggle_signal_like(p_signal_id)   -- atomic like toggle
increment_viewers(stream_id)      -- race-safe sayaç
decrement_viewers(stream_id)      -- race-safe sayaç
fn_update_post_likes_count()      -- trigger: post_likes → posts.likes
fn_update_post_comments_count()   -- trigger: comments → posts.comments
cleanup_expired_stories()         -- manuel/cron çağrı
```

## RLS Özeti

- **Tüm tablolarda RLS etkin**
- SELECT: genellikle herkese açık veya `auth.uid() = user_id`
- INSERT/UPDATE/DELETE: `auth.uid() = user_id` ile kısıtlı
- `error_logs`: herkes insert, sadece service_role okur
