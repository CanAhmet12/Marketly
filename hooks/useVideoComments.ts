import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface VideoComment {
  id:         string;
  video_id:   string;
  user_id:    string;
  content:    string;
  likes:      number;
  is_pinned:  boolean;
  created_at: string;
  // joined from profiles
  author_name:   string;
  author_avatar: string | null;
  author_handle: string;
}

export function useVideoComments(videoId: string) {
  const { user } = useAuth();
  const [comments,      setComments]      = useState<VideoComment[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [sending,       setSending]       = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      // ── 1. Yorumları çek ──────────────────────────────────────────────
      const { data } = await supabase
        .from('video_comments')
        .select('id, video_id, user_id, content, likes, is_pinned, created_at')
        .eq('video_id', videoId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        // ── 2. Profiles ayrı çek ─────────────────────────────────────────
        const userIds = [...new Set(data.map((c: any) => c.user_id))];
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);

        const profMap: Record<string, any> = {};
        for (const p of profData ?? []) profMap[p.id] = p;

        setComments(data.map((c: any) => {
          const prof = profMap[c.user_id];
          return {
            id:            c.id,
            video_id:      c.video_id,
            user_id:       c.user_id,
            content:       c.content,
            likes:         c.likes     ?? 0,
            is_pinned:     c.is_pinned ?? false,
            created_at:    c.created_at,
            author_name:   prof?.full_name ?? prof?.username ?? 'Kullanıcı',
            author_avatar: prof?.avatar_url ?? null,
            author_handle: prof?.username ? `@${prof.username}` : '@kullanici',
          };
        }));
      } else {
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();

    // Realtime subscription
    const channel = supabase
      .channel(`video_comments:${videoId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'video_comments',
        filter: `video_id=eq.${videoId}`,
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchComments, videoId]);

  const sendComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !content.trim()) return false;
    setSending(true);
    try {
      const { data: newComment, error } = await supabase
        .from('video_comments')
        .insert({ video_id: videoId, user_id: user.id, content: content.trim() })
        .select('id, video_id, user_id, content, likes, is_pinned, created_at')
        .single();
      if (error) throw error;
      // Optimistic: realtime'ı beklemeden anında ekle
      if (newComment) {
        const { data: prof } = await supabase
          .from('profiles').select('full_name, username, avatar_url').eq('id', user.id).maybeSingle();
        setComments(prev => [{
          id: newComment.id, video_id: newComment.video_id,
          user_id: newComment.user_id, content: newComment.content,
          likes: 0, is_pinned: false, created_at: newComment.created_at,
          author_name:   prof?.full_name ?? prof?.username ?? 'Kullanıcı',
          author_avatar: prof?.avatar_url ?? null,
          author_handle: prof?.username ? `@${prof.username}` : '@kullanici',
        }, ...prev]);
      }
      return true;
    } catch {
      return false;
    } finally {
      setSending(false);
    }
  }, [user?.id, videoId]);

  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user?.id) return false;
    setComments(prev => prev.filter(c => c.id !== commentId)); // optimistic
    try {
      const { error } = await supabase
        .from('video_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
      if (error) {
        await fetchComments(); // rollback
        return false;
      }
      return true;
    } catch {
      await fetchComments();
      return false;
    }
  }, [user?.id, fetchComments]);

  const likeComment = useCallback(async (commentId: string): Promise<boolean> => {
    // Beğenilmişse tekrar beğenme
    if (likedComments.has(commentId)) return false;
    if (!user?.id) return false;

    // Optimistic
    setLikedComments(prev => new Set([...prev, commentId]));
    setComments(prev =>
      prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c)
    );
    try {
      // Atomic increment via RPC (yoksa raw update)
      const { error } = await supabase.rpc('increment_video_comment_likes', { cid: commentId });
      if (error) {
        // RPC yoksa normal update ile dene (mevcut + 1)
        const comment = comments.find(c => c.id === commentId);
        const { error: e2 } = await supabase
          .from('video_comments')
          .update({ likes: (comment?.likes ?? 0) + 1 })
          .eq('id', commentId);
        if (e2) throw e2;
      }
      return true;
    } catch {
      // Rollback
      setLikedComments(prev => { const s = new Set(prev); s.delete(commentId); return s; });
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c)
      );
      return false;
    }
  }, [likedComments, user?.id, comments]);

  return { comments, loading, sending, likedComments, sendComment, deleteComment, likeComment, refetch: fetchComments };
}
