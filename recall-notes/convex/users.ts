import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
        age: v.optional(v.number()),
        sex: v.optional(v.string()),
        favoriteArtist: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", args);
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});