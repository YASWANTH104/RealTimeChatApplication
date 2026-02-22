import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

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

export const toggle = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    if (!EMOJIS.includes(args.emoji)) {
      throw new Error("Invalid emoji");
    }

    const me = await getCurrentUser(ctx);

    // Check if user has this exact emoji on this message
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user_emoji", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", me._id)
          .eq("emoji", args.emoji),
      )
      .unique();

    if (existing) {
      // Remove the reaction if it already exists (toggle off)
      await ctx.db.delete(existing._id);
    } else {
      // Remove any other emoji reactions from this user on this message (only one emoji per user)
      const allUserReactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
        .collect();

      for (const reaction of allUserReactions) {
        if (reaction.userId === me._id) {
          await ctx.db.delete(reaction._id);
        }
      }

      // Add the new emoji reaction
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: me._id,
        emoji: args.emoji,
      });
    }
  },
});

export const listByMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    const grouped: Record<
      string,
      { emoji: string; count: number; userReacted: boolean }
    > = {};
    const me = await getCurrentUser(ctx).catch(() => null);

    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          userReacted: false,
        };
      }
      grouped[reaction.emoji].count++;
      if (me && reaction.userId === me._id) {
        grouped[reaction.emoji].userReacted = true;
      }
    }

    return Object.values(grouped);
  },
});
