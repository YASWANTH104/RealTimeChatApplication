import { mutation, query } from "./_generated/server";

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!me) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
    } else {
      await ctx.db.insert("presence", { userId: me._id, lastSeen: Date.now() });
    }
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const listOnline = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const presence = await ctx.db.query("presence").collect();
    return presence
      .filter((record) => now - record.lastSeen < 30000)
      .map((record) => record.userId);
  },
});
