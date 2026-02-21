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

export const getOrCreateDm = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const dmKey = [me._id, args.otherUserId].sort().join("|");

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_dmKey", (q) => q.eq("dmKey", dmKey))
      .unique();

    if (existing) {
      const member = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation_user", (q) =>
          q.eq("conversationId", existing._id).eq("userId", me._id)
        )
        .unique();

      if (!member) {
        await ctx.db.insert("conversationMembers", {
          conversationId: existing._id,
          userId: me._id,
          role: "member",
          lastReadAt: 0,
        });
      }
      return existing._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      dmKey,
      createdAt: Date.now(),
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: me._id,
      role: "member",
      lastReadAt: 0,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
      role: "member",
      lastReadAt: 0,
    });

    return conversationId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me) return [];
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const presence = await ctx.db.query("presence").collect();
    const now = Date.now();
    const onlineIds = new Set(
      presence
        .filter((record) => now - record.lastSeen < 30000)
        .map((record) => record.userId)
    );

    const result = [];
    for (const membership of memberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (!conversation) continue;

      let title = conversation.name ?? "Conversation";
      let subtitle = conversation.isGroup ? "Group chat" : "Direct message";
      let avatarUrl: string | null | undefined;
      let isOnline = false;

      if (!conversation.isGroup) {
        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        const other = members.find((member) => member.userId !== me._id);
        if (other) {
          const otherUser = await ctx.db.get(other.userId);
          if (otherUser) {
            title = otherUser.name;
            subtitle = otherUser.username ?? "Direct message";
            avatarUrl = otherUser.imageUrl;
            isOnline = onlineIds.has(otherUser._id);
          }
        }
      }

      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_conversation_createdAt", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .order("desc")
        .first();

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation_createdAt", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();

      const unreadCount = messages.filter(
        (message) =>
          message.createdAt > membership.lastReadAt &&
          message.senderId !== me._id
      ).length;

      result.push({
        _id: conversation._id,
        title,
        subtitle,
        avatarUrl: avatarUrl ?? null,
        lastMessage: lastMessage
          ? lastMessage.deletedAt
            ? "Message deleted"
            : lastMessage.body
          : null,
        lastMessageAt: lastMessage?.createdAt ?? null,
        unreadCount,
        isOnline,
      });
    }

    return result.sort((a, b) => {
      const aTime = a.lastMessageAt ?? 0;
      const bTime = b.lastMessageAt ?? 0;
      return bTime - aTime;
    });
  },
});

export const get = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me) return null;
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) return null;

    let title = conversation.name ?? "Conversation";
    let subtitle = conversation.isGroup ? "Group chat" : "Direct message";
    let avatarUrl: string | null | undefined;
    let isOnline = false;

    if (!conversation.isGroup) {
      const members = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id)
        )
        .collect();
      const other = members.find((member) => member.userId !== me._id);
      if (other) {
        const otherUser = await ctx.db.get(other.userId);
        if (otherUser) {
          title = otherUser.name;
          subtitle = otherUser.username ?? "Direct message";
          avatarUrl = otherUser.imageUrl;

          const presence = await ctx.db
            .query("presence")
            .withIndex("by_user", (q) => q.eq("userId", otherUser._id))
            .unique();
          if (presence && Date.now() - presence.lastSeen < 30000) {
            isOnline = true;
          }
        }
      }
    }

    return {
      _id: conversation._id,
      title,
      subtitle,
      avatarUrl: avatarUrl ?? null,
      isOnline,
    };
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const me = await getCurrentUserOrNull(ctx);
    if (!me) return;
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id)
      )
      .unique();
    if (!membership) return;
    await ctx.db.patch(membership._id, { lastReadAt: Date.now() });
  },
});
