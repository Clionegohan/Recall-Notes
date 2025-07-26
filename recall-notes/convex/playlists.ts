import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPlaylistsByUser = query({
    args: { userId: v.id("users") },
    handler: async ( ctx, args) => {
        return await ctx.db
          .query("playlists")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();
    },
});

// Spotify IDで重複チェック
export const checkDuplicateBySpotifyId = query({
    args: { 
        userId: v.id("users"),
        spotifyId: v.string()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("playlists")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("spotifyId"), args.spotifyId))
            .first();
        
        return existing !== null;
    },
});

// タイトルとアーティストで重複チェック
export const checkDuplicateByTitleArtist = query({
    args: { 
        userId: v.id("users"),
        title: v.string(),
        artist: v.string()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("playlists")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => 
                q.and(
                    q.eq(q.field("title"), args.title),
                    q.eq(q.field("artist"), args.artist)
                )
            )
            .first();
        
        return existing !== null;
    },
});

export const addPlaylist = mutation({
    args: {
        title: v.string(),
        artist: v.string(),
        userId: v.id("users"),
        spotifyId: v.optional(v.string()),
        albumArt: v.optional(v.string()),
        albumName: v.optional(v.string()),
        albumId: v.optional(v.string()),
        artistId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 重複チェック
        let isDuplicate = false;
        
        // Spotify IDがある場合はSpotify IDで重複チェック
        if (args.spotifyId) {
            const duplicateBySpotifyId = await ctx.db
                .query("playlists")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("spotifyId"), args.spotifyId))
                .first();
            isDuplicate = duplicateBySpotifyId !== null;
        } else {
            // Spotify IDがない場合はタイトル+アーティストで重複チェック
            const duplicateByTitleArtist = await ctx.db
                .query("playlists")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .filter((q) => 
                    q.and(
                        q.eq(q.field("title"), args.title),
                        q.eq(q.field("artist"), args.artist)
                    )
                )
                .first();
            isDuplicate = duplicateByTitleArtist !== null;
        }
        
        if (isDuplicate) {
            throw new Error("この楽曲は既にプレイリストに追加されています");
        }
        
        return await ctx.db.insert("playlists", args);
    },
});
