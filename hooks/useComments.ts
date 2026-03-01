import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../lib/notifications';

export interface Comment {
  id:           string;
  post_id:      string;
  user_id:      string;
  content:      string;
  created_at:   string;
  author_name:   string;
  author_handle: string;
  author_avatar: string | null;
  likes:         number;
  is_liked:      boolean;
}

export function useComments(postId: string | null) {
  const { user } = useAuth();
  const [comments,  setComments]  = useState<Comment[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at, likes_count')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error || !data) return;

      // Yazar bilgilerini çek
      const uids = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', uids);
      const pm: Record<string, any> = {};
      for (const p of profs ?? []) pm[p.id] = p;

      // Beğeni durumlarını kontrol et
      let likedSet = new Set<string>();
      if (user?.id) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', data.map((c: any) => c.id));
        likedSet = new Set((likes ?? []).map((l: any) => l.comment_id));
      }

      setComments(data.map((c: any) => {
        const prof = pm[c.user_id];
        return {
          id:            c.id,
          post_id:       c.post_id,
          user_id:       c.user_id,
          content:       c.content,
          created_at:    c.created_at,
          author_name:   prof?.full_name ?? prof?.username ?? 'Kullanıcı',
          author_handle: `@${prof?.username ?? 'user'}`,
          author_avatar: prof?.avatar_url ?? null,
          likes:         c.likes_count ?? 0,
          is_liked:      likedSet.has(c.id),
        };
      }));
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !postId || !content.trim()) return false;
    setSubmitting(true);
    try {
      // Yorumu ekle
      const { error: commentErr } = await supabase.from('comments').insert({
        post_id:  postId,
        user_id:  user.id,
        content:  content.trim(),
      });
      if (commentErr) return false;

      // Post comments sayacını artır
      try {
        const { error: rpcErr } = await supabase.rpc('increment_comments', { post_id: postId });
        if (rpcErr) throw rpcErr;
      } catch {
        const { data: postData } = await supabase
          .from('posts').select('comments_count, user_id').eq('id', postId).single();
        const current = (postData as any)?.comments_count ?? 0;
        await supabase.from('posts').update({ comments_count: current + 1 }).eq('id', postId);

        // Post sahibine yorum bildirimi
        const postOwnerId = (postData as any)?.user_id;
        if (postOwnerId && postOwnerId !== user.id) {
          createNotification({
            recipientId: postOwnerId,
            senderId:    user.id,
            type:        'comment',
            title:       'Gönderine yorum yaptı 💬',
            body:        content.trim().slice(0, 80),
            relatedId:   postId,
          });
        }
      }

      await fetchComments();
      return true;
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, postId, fetchComments]);

  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!user?.id) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const newLiked = !comment.is_liked;
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, is_liked: newLiked, likes: newLiked ? c.likes + 1 : Math.max(0, c.likes - 1) }
        : c
    ));

    if (newLiked) {
      await supabase.from('comment_likes').upsert(
        { user_id: user.id, comment_id: commentId },
        { onConflict: 'user_id,comment_id' }
      );
    } else {
      await supabase.from('comment_likes').delete()
        .eq('user_id', user.id).eq('comment_id', commentId);
    }
  }, [user?.id, comments]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.id) return;
    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, [user?.id]);

  return { comments, loading, submitting, addComment, toggleCommentLike, deleteComment, refetch: fetchComments };
}
