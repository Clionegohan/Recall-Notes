import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
        age: v.optional(v.number()),
        sex: v.optional(v.string()),
        favoriteArtist: v.optional(v.array(v.string())),
    }),

    playlists: defineTable({
        title: v.string(),
        artist: v.string(),
        userId: v.string(),
        spotifyId: v.string(),
    }).index("by_user", ["userId"])
      .index("by_artist", ["artist"]),
});
