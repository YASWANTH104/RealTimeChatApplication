"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";
import { Avatar } from "./Avatar";

export function ConversationView({
  conversationId,
  onBack,
  isMobile,
}: {
  conversationId: Id<"conversations">;
  onBack?: () => void;
  isMobile: boolean;
}) {
  const conversation = useQuery(api.conversations.get, { conversationId });
  const messages = useQuery(api.messages.list, { conversationId });
  const markRead = useMutation(api.conversations.markRead);

  useEffect(() => {
    if (!messages) return;
    void markRead({ conversationId });
  }, [messages?.length, conversationId, markRead]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-4 border-b border-white/70 bg-white/70 px-4 py-3">
        {isMobile && (
          <button
            onClick={onBack}
            className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700"
          >
            Back
          </button>
        )}
        {conversation?.avatarUrl && (
          <Avatar
            src={conversation.avatarUrl}
            alt={conversation.title}
            size={42}
          />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-800">
            {conversation?.title ?? "Conversation"}
          </p>
          <p className="text-xs text-ink-500">
            {conversation?.subtitle ?? "Starting a new chat"}
          </p>
        </div>
        {conversation?.isOnline && (
          <span className="flex items-center gap-2 text-xs text-mint-500">
            <span className="h-2 w-2 rounded-full bg-mint-400" />
            Online
          </span>
        )}
      </div>

      <MessageList conversationId={conversationId} />

      <div className="px-4 pb-2">
        <TypingIndicator conversationId={conversationId} />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
}
