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

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me) return [];
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const usersCache = new Map();
    const results = [];
    for (const message of messages) {
      let sender = usersCache.get(message.senderId);
      if (!sender) {
        sender = await ctx.db.get(message.senderId);
        usersCache.set(message.senderId, sender);
      }
      results.push({
        _id: message._id,
        body: message.body,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: sender?.name ?? "Unknown",
        senderImage: sender?.imageUrl ?? null,
        isMine: message.senderId === me._id,
        deletedAt: message.deletedAt ?? null,
      });
    }
    return results;
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), body: v.string() },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) {
      throw new Error("Not a member of this conversation");
    }

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: me._id,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});
