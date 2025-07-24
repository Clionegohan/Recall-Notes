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

export const addPlaylist = mutation({
    args: {
        title: v.string(),
        artist: v.string(),
        userId: v.id("users"),
        spotifyId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("playlists", args);
    },
});
