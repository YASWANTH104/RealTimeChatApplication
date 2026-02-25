"use client";

import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

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

  const {
    isListening,
    isSupported: speechSupported,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ language: "en-US" });

  useEffect(() => {
    if (transcript) {
      setValue((prev) => prev + transcript);
      resetTranscript();
    }
  }, [transcript]);

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
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
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
      {speechError && (
        <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          Speech recognition error: {speechError}
        </div>
      )}
      {isListening && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <div className="flex gap-1">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"
              style={{ animationDelay: "0.2s" }}
            ></span>
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"
              style={{ animationDelay: "0.4s" }}
            ></span>
          </div>
          <span>Listening...</span>
          {interimTranscript && (
            <span className="ml-auto italic">{interimTranscript}</span>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={value}
          onChange={(event) => handleTyping(event.target.value)}
          placeholder="Write a message or click the mic icon..."
          className="flex-1 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-500"
        />
        {speechSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isSending}
            className={`rounded-full p-2 transition ${
              isListening
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } disabled:opacity-40`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" />
              <path d="M4 11a1 1 0 011 1v2a5 5 0 0010 0v-2a1 1 0 112 0v2a7 7 0 11-14 0v-2a1 1 0 011-1z" />
            </svg>
          </button>
        )}
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
