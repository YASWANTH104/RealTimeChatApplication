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
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.set);
  const lastTypingRef = useRef(0);
  const failedMessageRef = useRef<string | null>(null);

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

    setIsSending(true);
    setError(null);
    failedMessageRef.current = trimmed;

    try {
      await sendMessage({ conversationId, body: trimmed });
      setValue("");
      failedMessageRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = () => {
    if (failedMessageRef.current) {
      setValue(failedMessageRef.current);
      handleSubmit({ preventDefault: () => { } } as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-white/70 bg-white/70 px-4 py-3">
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={value}
          onChange={(event) => handleTyping(event.target.value)}
          placeholder="Write a message..."
          className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-500"
        />
        <button
          type="submit"
          disabled={!value.trim() || isSending}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
