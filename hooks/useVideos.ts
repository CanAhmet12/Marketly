/**
 * useVideos — Supabase `posts` tablosundan gerçek video/short/live verilerini çeker.
 * ADD_TABLES.sql çalıştırılmışsa tam kolonları kullanır; yoksa temel kolonlara düşer.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { VideoCategory, VideoItem } from '../data/mockVideos';
import { mockVideos } from '../data/mockVideos';

export type VideoType = 'video' | 'short' | 'live' | 'all';

const PAGE_SIZE = 12;

// Tam kolon listesi (ADD_TABLES.sql sonrası)
const FULL_SELECT =
  'id, user_id, creator_id, type, title, description, content, asset_tag, asset_tags, ' +
  'thumbnail_url, image_url, video_url, duration, likes_count, comments_count, views_count, ' +
  'shares_count, is_premium, created_at';

// Temel kolon listesi (ADD_TABLES.sql çalıştırılmamışsa)
const BASIC_SELECT = 'id, user_id, content, asset_tag, image_url, created_at';

async function fetchProfilesMap(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {};
  const unique = [...new Set(userIds)];
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, tier, verified, follower_count')
    .in('id', unique);
  const map: Record<string, any> = {};
  for (const p of data ?? []) map[p.id] = p;
  return map;
}

function mapToVideoItem(row: any, prof: any): VideoItem {
  const followerN = prof?.follower_count ?? 0;
  const followersStr = followerN >= 1000 ? `${(followerN / 1000).toFixed(1)}K` : String(followerN);
  const tags: string[] = row.asset_tags ?? (row.asset_tag ? [row.asset_tag] : []);
  const creatorId = row.creator_id ?? row.user_id ?? '';

  const category: VideoCategory =
    tags.some((t: string) => ['BTC', 'ETH', 'SOL', 'XRP', 'BNB'].includes(t.toUpperCase())) ? 'kripto' :
    tags.some((t: string) => ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN'].includes(t.toUpperCase())) ? 'hisseler' :
    row.type === 'live' ? 'live' : 'for_you';

  return {
    id:        row.id,
    title:     row.title ?? row.content ?? 'Başlıksız Video',
    videoUrl:  row.video_url ?? undefined,
    thumbnail: row.thumbnail_url ?? row.image_url ??
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
    category,
    assetTags: tags,
    isLive:    row.type === 'live',
    duration:  row.duration
      ? `${Math.floor(row.duration / 60)}:${String(row.duration % 60).padStart(2, '0')}`
      : undefined,
    timeAgo: timeAgo(row.created_at),
    type:    'video',
    creator: {
      id:        prof?.id ?? creatorId,
      name:      prof?.full_name ?? prof?.username ?? 'Kullanıcı',
      avatar:    prof?.avatar_url ?? `https://i.pravatar.cc/80?u=${creatorId}`,
      followers: followersStr,
      verified:  prof?.verified ?? false,
    },
    stats: {
      likes:    row.likes_count ?? row.likes ?? 0,
      comments: row.comments_count ?? row.comments ?? 0,
      shares:   row.shares_count ?? 0,
      views:    row.views_count ?? 0,
    },
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function isSchemaMissing(msg?: string) {
  return !!(msg && (
    msg.includes('column') ||
    msg.includes('property') ||
    msg.includes('does not exist') ||
    msg.includes('42703')
  ));
}

export function useVideos(opts: {
  type?:      VideoType;
  category?:  VideoCategory;
  assetTag?:  string;
  creatorId?: string;
} = {}) {
  const [videos,   setVideos]   = useState<VideoItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [hasMore,  setHasMore]  = useState(true);
  const [page,     setPage]     = useState(0);
  const [usedMock, setUsedMock] = useState(false);

  const fetchVideos = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;

    const buildQuery = (selectCols: string, hasTypeCol: boolean) => {
      let q = supabase
        .from('posts')
        .select(selectCols)
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

      if (hasTypeCol && opts.type && opts.type !== 'all') {
        q = q.eq('type', opts.type);
      }
      if (opts.creatorId) q = q.eq('user_id', opts.creatorId);
      if (opts.assetTag)  q = q.eq('asset_tag', opts.assetTag.toUpperCase());
      return q;
    };

    try {
      // ── 1. Tam kolonlarla dene (ADD_TABLES.sql çalıştırıldıysa) ──────────
      let { data, error } = await buildQuery(FULL_SELECT, true);

      // Eğer kolon hatası varsa temel kolonlara düş
      if (error && isSchemaMissing(error.message)) {
        const fallback = await buildQuery(BASIC_SELECT, false);
        data  = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        // ── 2. Profilleri ayrı çek ─────────────────────────────────────────
        const uids = data.map((r: any) => r.creator_id ?? r.user_id).filter(Boolean);
        const profMap = await fetchProfilesMap(uids);
        const mapped = data.map((row: any) =>
          mapToVideoItem(row, profMap[row.creator_id ?? row.user_id])
        );

        if (reset) { setVideos(mapped); setPage(1); }
        else        { setVideos(prev => [...prev, ...mapped]); setPage(p => p + 1); }
        setHasMore(mapped.length === PAGE_SIZE);
        setUsedMock(false);
        return;
      }
    } catch (e) {
      console.warn('[useVideos] Supabase hatası, mock\'a düşülüyor:', e);
    }

    // ── Fallback: mock veriler ─────────────────────────────────────────────
    const filtered =
      opts.type === 'live' ? mockVideos.filter(v => v.isLive) :
      opts.type === 'short' ? mockVideos.slice(0, 6) :
      mockVideos;
    if (reset || videos.length === 0) setVideos(filtered);
    setHasMore(false);
    setUsedMock(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, opts.type, opts.creatorId, opts.assetTag]);

  useEffect(() => {
    fetchVideos(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.type, opts.creatorId, opts.assetTag]);

  useEffect(() => { setLoading(false); }, [videos]);

  return {
    videos, loading, hasMore, usedMock,
    loadMore: () => { if (!loading && hasMore) fetchVideos(false); },
    refetch:  () => fetchVideos(true),
  };
}
