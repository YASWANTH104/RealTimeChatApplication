import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sync = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    const displayName =
      identity.name ??
      identity.nickname ??
      identity.email ??
      "Unknown";

    const payload = {
      clerkId,
      name: displayName === "Unknown" ? (args.name ?? displayName) : displayName,
      username: identity.nickname ?? args.username ?? undefined,
      email: identity.email ?? args.email ?? "",
      imageUrl: identity.pictureUrl ?? args.imageUrl ?? undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...payload,
      createdAt: Date.now(),
    });
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const users = await ctx.db.query("users").collect();
    const normalized = args.search?.trim().toLowerCase() ?? "";

    const presence = await ctx.db.query("presence").collect();
    const now = Date.now();
    const onlineIds = new Set(
      presence
        .filter((record) => now - record.lastSeen < 30000)
        .map((record) => record.userId)
    );

    return users
      .filter((user) => user._id !== me?._id)
      .filter((user) =>
        normalized
          ? user.name.toLowerCase().includes(normalized)
          : true
      )
      .map((user) => ({
        _id: user._id,
        name: user.name,
        imageUrl: user.imageUrl ?? null,
        isOnline: onlineIds.has(user._id),
      }));
  },
});
