import type { PostCommentRow } from "@/features/post/types";
import type { WatchVideoComment } from "@/features/watch/types";

import { buildMockPostCommentsList } from "@/mock/adapters/social-discussion-data";

import { MOCK_POST_SOURCES } from "./posts";
import { MOCK_PROFILES } from "./profiles";

const bodies = [
  "Çok faydalı, teşekkürler.",
  "Seviye bölgeleri netleşmiş.",
  "Ben de aynı senaryoyu izliyorum.",
  "Stop mesafesi biraz geniş kalmadı mı?",
  "Grafikte uyumsuzluk var gibi.",
  "Fed öncesi pozisyon küçültmek mantıklı.",
  "THYAO tarafında hacim artmış.",
  "BTC dominansı yükselirse altlar zayıflar.",
  "Özet için süpersiniz.",
  "Kaynak linkini paylaşabilir misiniz?",
  "VIOP tarafında dikkat edilmesi gerekenler?",
  "Uzun vade için not aldım.",
  "Kısa vadede daha temkinli olurdum.",
  "XU100 için pivot kaç?",
  "Altın tarafında real getiri negatif.",
];

function av(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=1e293b&color=94a3b8`;
}

export const MOCK_VIDEO_POST_IDS = MOCK_POST_SOURCES.filter((p) =>
  ["video", "short", "live"].includes((p.type ?? "").toLowerCase()),
).map((p) => p.id);

/** Gönderi yorumları — SocialRepository / `buildMockPostCommentsList` ile üretilir */
export function mockPostCommentsFor(postId: string): PostCommentRow[] {
  return buildMockPostCommentsList(postId);
}

function buildVideoComments(): WatchVideoComment[] {
  const out: WatchVideoComment[] = [];
  let n = 1;
  MOCK_VIDEO_POST_IDS.forEach((vid, vi) => {
    for (let j = 0; j < 3; j++) {
      const prof = MOCK_PROFILES[(vi + j + 1) % MOCK_PROFILES.length];
      out.push({
        id: `mock-vc-${n}`,
        video_id: vid,
        user_id: prof.id,
        content: j === 0 ? "İlk yorum — mock veri." : `Zaman damgası ${j + 1}: ${bodies[(vi + j) % bodies.length]}`,
        likes: (vi + j) % 45,
        is_pinned: j === 0 && vi % 5 === 0,
        created_at: new Date(Date.now() - (n * 77_000)).toISOString(),
        author_name: prof.full_name ?? prof.username,
        author_avatar: av(prof.full_name ?? prof.username),
        author_handle: `@${prof.username}`,
      });
      n += 1;
    }
  });
  return out;
}

export const MOCK_VIDEO_COMMENTS: WatchVideoComment[] = buildVideoComments();

export function mockVideoCommentsFor(videoPostId: string): WatchVideoComment[] {
  return MOCK_VIDEO_COMMENTS.filter((c) => c.video_id === videoPostId).sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
