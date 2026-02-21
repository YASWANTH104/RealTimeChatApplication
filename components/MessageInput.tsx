"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function MessageInput({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  const [value, setValue] = useState("");
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);
  const lastTypingRef = useRef(0);

  const handleTyping = (text: string) => {
    setValue(text);
    const now = Date.now();
    if (now - lastTypingRef.current > 600 && text.trim().length > 0) {
      lastTypingRef.current = now;
      void setTyping({ conversationId });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    await sendMessage({ conversationId, body: trimmed });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-t border-white/70 bg-white/70 px-4 py-3"
    >
      <input
        value={value}
        onChange={(event) => handleTyping(event.target.value)}
        placeholder="Write a message..."
        className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-500"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
