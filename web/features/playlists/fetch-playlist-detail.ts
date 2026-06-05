import type { SupabaseClient } from "@supabase/supabase-js";

export type PlaylistDbRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: "public" | "unlisted" | "private";
  video_count: number | null;
  updated_at: string;
  created_at: string;
};

export type PlaylistItemRow = {
  id: string;
  playlist_id: string;
  video_id: string;
  position: number;
};

export type PlaylistPostRow = {
  id: string;
  type: string | null;
  title: string | null;
  content: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  views_count: number | null;
  asset_tag: string | null;
};

export type PlaylistOwnerRow = {
  id: string;
  username: string | null;
  full_name: string | null;
};

export type PlaylistDetailFetchResult = {
  playlist: PlaylistDbRow;
  owner: PlaylistOwnerRow;
  items: PlaylistItemRow[];
  posts: PlaylistPostRow[];
};

/** `playlists` + `playlist_items` + `posts` + `profiles` */
export async function fetchPlaylistDetail(
  client: SupabaseClient,
  playlistId: string,
): Promise<PlaylistDetailFetchResult | null> {
  const { data: playlist, error: plErr } = await client
    .from("playlists")
    .select("id, user_id, title, description, visibility, video_count, updated_at, created_at")
    .eq("id", playlistId)
    .maybeSingle();

  if (plErr || !playlist) {
    if (plErr) console.warn("[playlists] fetchPlaylistDetail", plErr.message);
    return null;
  }

  const { data: owner } = await client
    .from("profiles")
    .select("id, username, full_name")
    .eq("id", playlist.user_id)
    .maybeSingle();

  const { data: items, error: itemsErr } = await client
    .from("playlist_items")
    .select("id, playlist_id, video_id, position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });

  if (itemsErr) {
    console.warn("[playlists] playlist_items", itemsErr.message);
  }

  const itemRows = (items ?? []) as PlaylistItemRow[];
  const postIds = itemRows.map((i) => i.video_id);

  let posts: PlaylistPostRow[] = [];
  if (postIds.length > 0) {
    const { data: postData, error: postErr } = await client
      .from("posts")
      .select("id, type, title, content, thumbnail_url, image_url, views_count, asset_tag")
      .in("id", postIds);

    if (postErr) {
      console.warn("[playlists] posts", postErr.message);
    } else {
      posts = (postData ?? []) as PlaylistPostRow[];
    }
  }

  return {
    playlist: playlist as PlaylistDbRow,
    owner: (owner ?? { id: playlist.user_id, username: null, full_name: null }) as PlaylistOwnerRow,
    items: itemRows,
    posts,
  };
}
