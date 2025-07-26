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
        spotifyId: v.optional(v.string()),
        albumArt: v.optional(v.string()),
        albumName: v.optional(v.string()),
        albumId: v.optional(v.string()),
        artistId: v.optional(v.string()),
    }).index("by_user", ["userId"])
      .index("by_artist", ["artist"])
      .index("by_album", ["albumId"])
      .index("by_artist_id", ["artistId"]),
});
