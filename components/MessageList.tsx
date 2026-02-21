"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/format";

export function MessageList({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const messages = useQuery(api.messages.list, { conversationId });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showNew, setShowNew] = useState(false);
  const atBottomRef = useRef(true);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setShowNew(false);
    atBottomRef.current = true;
  };

  useEffect(() => {
    if (!messages) return;
    if (atBottomRef.current) {
      scrollToBottom();
    } else {
      setShowNew(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages?.length]);

  if (!messages) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-500">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-ink-500">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
          const isAtBottom = distance < 120;
          atBottomRef.current = isAtBottom;
          if (isAtBottom) {
            setShowNew(false);
          }
        }}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-4"
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={cn(
              "flex",
              message.isMine ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-glow",
                message.isMine
                  ? "bg-ink-900 text-white"
                  : "bg-white text-ink-800"
              )}
            >
              {!message.isMine && (
                <p className="text-xs font-semibold text-ink-500">
                  {message.senderName}
                </p>
              )}
              <p className={cn(message.deletedAt && "italic text-ink-400")}>
                {message.deletedAt ? "This message was deleted." : message.body}
              </p>
              <p className="mt-1 text-right text-[11px] text-ink-400">
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white shadow-glow"
        >
          ↓ New messages
        </button>
      )}
    </div>
  );
}
