-- RPC CLOSURE MEGA SPRINT — 5 Haziran 2026
-- Risk: DÜŞÜK-ORTA — SECURITY DEFINER SELECT aggregations, auth-scoped analytics
-- Rollback: DROP FUNCTION IF EXISTS {name}

-- ── 1. get_creators_directory ─────────────────────────────────
-- Public creator directory — yalnızca güvenli profil alanları
CREATE OR REPLACE FUNCTION get_creators_directory(p_limit INT DEFAULT 80)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.sort_score DESC), '[]'::jsonb)
    FROM (
      SELECT
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.bio,
        p.tier,
        p.verified,
        COALESCE(p.follower_count, 0)     AS follower_count,
        COALESCE(p.signal_accuracy, 0)    AS signal_accuracy,
        COALESCE(p.marketcoin, 0)         AS marketcoin,
        p.created_at,
        COUNT(DISTINCT po.id)             AS post_count,
        COUNT(DISTINCT s.id)              AS signal_count,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) AS active_signal_count,
        MAX(po.created_at)                AS last_post_at,
        BOOL_OR(po.type = 'live')         AS is_live,
        (
          COALESCE(p.signal_accuracy, 0) * 0.4
          + COALESCE(p.follower_count, 0) * 0.001
          + COUNT(DISTINCT s.id) * 0.5
          + COUNT(DISTINCT po.id) * 0.2
        ) AS sort_score
      FROM profiles p
      LEFT JOIN posts   po ON po.user_id = p.id
      LEFT JOIN signals s  ON s.creator_id = p.id
      WHERE p.username IS NOT NULL
      GROUP BY p.id
      HAVING COUNT(DISTINCT po.id) > 0
          OR COUNT(DISTINCT s.id) > 0
          OR COALESCE(p.follower_count, 0) > 0
      ORDER BY sort_score DESC
      LIMIT GREATEST(1, LEAST(p_limit, 200))
    ) t
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_creators_directory(INT) TO anon, authenticated;

-- ── 2. get_studio_analytics_bundle ────────────────────────────
-- Creator analytics — yalnızca auth.uid() sahibi görebilir
CREATE OR REPLACE FUNCTION get_studio_analytics_bundle(p_timeframe TEXT DEFAULT '7d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   UUID := auth.uid();
  v_days  INT;
  v_since TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  v_days := CASE p_timeframe
    WHEN '28d' THEN 28
    WHEN '90d' THEN 90
    ELSE 7
  END;
  v_since := now() - (v_days || ' days')::interval;

  SELECT jsonb_build_object(
    'owner_id', v_uid,
    'timeframe', p_timeframe,
    'total_views', COALESCE(SUM(po.views_count), 0),
    'total_likes', COALESCE(SUM(po.likes_count), 0),
    'total_comments', COALESCE(SUM(po.comments_count), 0),
    'published_count', COUNT(po.id),
    'draft_count', (
      SELECT COUNT(*)::INT FROM post_drafts d WHERE d.user_id = v_uid
    ),
    'scheduled_count', (
      SELECT COUNT(*)::INT FROM scheduled_posts sp
      WHERE sp.user_id = v_uid AND sp.status IN ('pending', 'processing')
    ),
    'follower_count', COALESCE((
      SELECT pr.follower_count FROM profiles pr WHERE pr.id = v_uid
    ), 0),
    'follower_growth_7d', 0,
    'signal_copy_count', COALESCE((
      SELECT SUM(s.copies_count)::INT FROM signals s WHERE s.creator_id = v_uid
    ), 0),
    'engagement_rate', CASE
      WHEN COALESCE(SUM(po.views_count), 0) > 0
      THEN ROUND((COALESCE(SUM(po.likes_count), 0) + COALESCE(SUM(po.comments_count), 0))::numeric
           / NULLIF(SUM(po.views_count), 0) * 100, 2)
      ELSE 0
    END,
    'top_posts', COALESCE((
      SELECT jsonb_agg(row_to_json(tp) ORDER BY tp.views DESC)
      FROM (
        SELECT
          po2.id,
          COALESCE(po2.title, LEFT(po2.content, 60), 'İsimsiz') AS title,
          COALESCE(po2.views_count, 0) AS views,
          COALESCE(po2.likes_count, 0) AS likes,
          po2.thumbnail_url,
          po2.image_url,
          po2.type
        FROM posts po2
        WHERE po2.user_id = v_uid
        ORDER BY COALESCE(po2.views_count, 0) DESC
        LIMIT 8
      ) tp
    ), '[]'::jsonb),
    'daily_views', COALESCE((
      SELECT jsonb_agg(row_to_json(dv) ORDER BY dv.day)
      FROM (
        SELECT
          to_char(date_trunc('day', po3.created_at), 'DD Mon') AS label,
          COALESCE(SUM(po3.views_count), 0)::INT AS value,
          date_trunc('day', po3.created_at) AS day
        FROM posts po3
        WHERE po3.user_id = v_uid
          AND po3.created_at >= v_since
        GROUP BY date_trunc('day', po3.created_at)
        ORDER BY day
      ) dv
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM posts po
  WHERE po.user_id = v_uid;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_studio_analytics_bundle(TEXT) TO authenticated;
