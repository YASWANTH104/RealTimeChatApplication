"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function TypingIndicator({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const typingUsers = useQuery(api.typing.list, { conversationId, now });

  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing...`
      : "Multiple people are typing...";

  return (
    <div className="flex items-center gap-2 text-sm text-ink-500">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-400 [animation-delay:300ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
}
