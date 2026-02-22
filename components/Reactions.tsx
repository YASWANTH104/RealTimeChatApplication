"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export function Reactions({
  messageId,
  isMine,
}: {
  messageId: Id<"messages">;
  isMine?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const reactions = useQuery(api.reactions.listByMessage, { messageId });
  const toggle = useMutation(api.reactions.toggle);

  if (!reactions) {
    return null;
  }

  const handleEmojiSelect = async (emoji: string) => {
    await toggle({ messageId, emoji });
    setShowPicker(false);
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={() => toggle({ messageId, emoji: reaction.emoji })}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition",
            reaction.userReacted
              ? "bg-mint-100 text-mint-700 border border-mint-300"
              : "bg-white text-ink-600 border border-ink-200 hover:border-ink-300",
          )}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-ink-200 text-ink-600 hover:border-ink-300 transition text-sm font-semibold"
        >
          +
        </button>
        {showPicker && (
          <div
            className={cn(
              "absolute bottom-full mb-2 flex flex-wrap gap-1 bg-white border border-ink-200 rounded-lg p-2 shadow-lg z-10 w-max",
              isMine ? "right-0" : "left-0",
            )}
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                className="text-lg hover:scale-125 transition hover:bg-ink-50 rounded p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
