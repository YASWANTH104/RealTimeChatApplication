"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const HEARTBEAT_INTERVAL = 15000;

export function usePresenceHeartbeat() {
  const { isSignedIn } = useAuth();
  const heartbeat = useMutation(api.presence.heartbeat);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    const sendHeartbeat = () => {
      void heartbeat({});
    };

    sendHeartbeat();
    timerRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [heartbeat, isSignedIn]);
}
