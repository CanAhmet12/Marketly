import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, key);

const POST_FEED_SELECT = `
  id, user_id, content, asset_tag, image_url, type, video_url, thumbnail_url, title,
  likes, comments, likes_count, comments_count, views_count, created_at,
  media_urls, mentioned_users, link_preview, quoted_post_id, reply_to_post_id,
  profiles!posts_user_id_fkey ( id, username, full_name, avatar_url, tier ),
  post_likes!left ( user_id )
`;

const t0 = Date.now();
const { data, error } = await sb
  .from("posts")
  .select(POST_FEED_SELECT)
  .is("reply_to_post_id", null)
  .or("type.is.null,type.not.in.(video,short,live,signal)")
  .order("likes", { ascending: false, nullsFirst: false })
  .order("created_at", { ascending: false })
  .range(0, 9);

console.log("ms:", Date.now() - t0);
console.log("error:", error?.message ?? "none");
console.log("count:", data?.length ?? 0);
