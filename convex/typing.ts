import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const me = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!me) {
    throw new Error("User not found");
  }
  return me;
}

async function getCurrentUserOrNull(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
}

export const set = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();

    const expiresAt = Date.now() + 2000;
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: me._id,
        expiresAt,
      });
    }
  },
});

export const list = query({
  args: { conversationId: v.id("conversations"), now: v.number() },
  handler: async (ctx, args) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me) return [];
    const now = args.now;
    const records = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const active = records.filter(
      (record) => record.expiresAt > now && record.userId !== me._id
    );

    const result = [];
    for (const record of active) {
      const user = await ctx.db.get(record.userId);
      if (user) {
        result.push({ userId: user._id, name: user.name });
      }
    }
    return result;
  },
});
