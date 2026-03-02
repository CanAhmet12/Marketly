import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../lib/notifications';

export interface Post {
  id:          string;
  user_id:     string;
  content:     string;
  asset_tag:   string | null;
  image_url:   string | null;
  likes:       number;
  comments:    number;
  created_at:  string;
  // Joined from profiles
  author_name:   string;
  author_handle: string;
  author_avatar: string | null;
  author_tier:   string;
  is_liked:      boolean;
}

async function fetchProfilesMap(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {};
  const unique = [...new Set(userIds)];
  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, tier')
    .in('id', unique);
  const map: Record<string, any> = {};
  for (const p of data ?? []) map[p.id] = p;
  return map;
}

const PAGE = 10;

export function usePosts(assetTag?: string, feedMode: 'all' | 'following' = 'all', creatorId?: string) {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ── pageRef: callback içinde page'i yakalamak yerine ref üzerinden oku
  // Bu sayede fetchPosts her page değişiminde yeniden oluşturulmaz.
  const pageRef = useRef(0);

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    const currentPage = reset ? 0 : pageRef.current;
    try {
      let followingIds: string[] = [];

      if (feedMode === 'following' && user?.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        followingIds = (followData ?? []).map((f: any) => f.following_id);
        if (followingIds.length === 0) {
          setPosts([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
      }

      let q = supabase
        .from('posts')
        .select('id, user_id, content, asset_tag, image_url, likes, comments, created_at')
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE, currentPage * PAGE + PAGE - 1);

      if (assetTag)  q = q.eq('asset_tag', assetTag.toUpperCase());
      if (creatorId) q = q.eq('user_id', creatorId);
      if (feedMode === 'following' && followingIds.length > 0) {
        q = q.in('user_id', followingIds);
      }

      const { data, error } = await q;
      if (error) throw error;

      if (!data || data.length === 0) {
        if (reset) { setPosts([]); pageRef.current = 0; }
        setHasMore(false);
        return;
      }

      const userIds    = data.map((r: any) => r.user_id);
      const profilesMap = await fetchProfilesMap(userIds);

      let likedSet = new Set<string>();
      if (user?.id) {
        const postIds = data.map((r: any) => r.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        likedSet = new Set((likes ?? []).map((l: any) => l.post_id));
      }

      const enriched: Post[] = data.map((row: any) => {
        const prof = profilesMap[row.user_id];
        return {
          id:            row.id,
          user_id:       row.user_id,
          content:       row.content,
          asset_tag:     row.asset_tag,
          image_url:     row.image_url,
          likes:         row.likes    ?? 0,
          comments:      row.comments ?? 0,
          created_at:    row.created_at,
          author_name:   prof?.full_name  ?? 'Kullanıcı',
          author_handle: '@' + (prof?.username ?? 'user'),
          author_avatar: prof?.avatar_url  ?? null,
          author_tier:   prof?.tier        ?? 'free',
          is_liked:      likedSet.has(row.id),
        };
      });

      if (reset) {
        setPosts(enriched);
        pageRef.current = 1;
      } else {
        setPosts(prev => [...prev, ...enriched]);
        pageRef.current = currentPage + 1;
      }
      setHasMore(enriched.length === PAGE);

    } catch (e) {
      console.warn('[usePosts]', e);
    } finally {
      setLoading(false);
    }
  // page kasıtlı olarak deps dışında — pageRef kullanıyoruz (stale closure önleme)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, assetTag, feedMode, creatorId]);

  // feedMode / user / assetTag değişince sıfırdan yükle
  useEffect(() => {
    pageRef.current = 0;
    setHasMore(true);
    fetchPosts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, assetTag, feedMode, creatorId]);

  // Realtime: yeni post gelince sadece ilk sayfa görüntüleniyorsa yenile
  const realtimeSub = useRef<any>(null);
  useEffect(() => {
    realtimeSub.current = supabase
      .channel('posts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          // Sadece ilk sayfa görüntüleniyorsa otomatik yenile
          if (pageRef.current <= 1) fetchPosts(true);
        }
      )
      .subscribe();

    return () => {
      if (realtimeSub.current) supabase.removeChannel(realtimeSub.current);
    };
  // fetchPosts stabil (page deps'ten çıktı) — subscription bir kez kurulur
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts]);

  const createPost = useCallback(async (
    content: string,
    asset_tag?: string,
    image_url?: string,
  ): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const payload: Record<string, any> = {
        user_id:   user.id,
        content:   content.trim(),
        asset_tag: asset_tag?.toUpperCase() ?? null,
      };
      if (image_url) payload.image_url = image_url;
      const { error } = await supabase.from('posts').insert(payload);
      if (error) throw error;
      await fetchPosts(true);
      return true;
    } catch { return false; }
  }, [user?.id, fetchPosts]);

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    if (!user?.id) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: !p.is_liked, likes: p.is_liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      if (post.is_liked) {
        await supabase.from('post_likes').delete()
          .eq('user_id', user.id).eq('post_id', postId);
        await supabase.from('posts')
          .update({ likes: Math.max(0, post.likes - 1) }).eq('id', postId);
      } else {
        await supabase.from('post_likes').insert({ user_id: user.id, post_id: postId });
        await supabase.from('posts')
          .update({ likes: post.likes + 1 }).eq('id', postId);
        if (post.user_id !== user.id) {
          createNotification({
            recipientId: post.user_id,
            senderId:    user.id,
            type:        'like',
            title:       'Gönderini beğendi ❤️',
            body:        post.content.slice(0, 80),
            relatedId:   postId,
          });
        }
      }
    } catch {
      // Rollback
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, is_liked: post.is_liked, likes: post.likes } : p
      ));
    }
  }, [user?.id, posts]);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
      return true;
    } catch { return false; }
  }, []);

  return {
    posts, loading, hasMore,
    createPost, toggleLike, deletePost,
    loadMore: () => fetchPosts(false),
    refresh:  () => fetchPosts(true),
  };
}
