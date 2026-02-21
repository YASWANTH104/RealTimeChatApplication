"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const sync = useMutation(api.users.sync);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    void sync({
      name: user.fullName ?? undefined,
      email: user.primaryEmailAddress?.emailAddress ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
      username: user.username ?? undefined,
    });
  }, [isLoaded, user?.id, sync, user?.fullName, user?.imageUrl, user?.username, user?.primaryEmailAddress?.emailAddress]);
}
