"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSyncUser } from "@/hooks/useSyncUser";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Sidebar } from "./Sidebar";
import { ConversationView } from "./ConversationView";
import { EmptyState } from "./EmptyState";
import { GroupCreate } from "./GroupCreate";

export function AppShell() {
  useSyncUser();
  usePresenceHeartbeat();

  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [search, setSearch] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);

  const isMobile = useIsMobile();

  const conversations = useQuery(api.conversations.list);
  const users = useQuery(api.users.list, { search });
  const getOrCreateDm = useMutation(api.conversations.getOrCreateDm);

  const handleStartConversation = async (userId: Id<"users">) => {
    const conversationId = await getOrCreateDm({ otherUserId: userId });
    setSelectedConversationId(conversationId);
  };

  const handleGroupCreated = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  const showChat = !isMobile || selectedConversationId !== null;
  const showSidebar = !isMobile || selectedConversationId === null;

  return (
    <div className="app-shell relative flex min-h-screen w-full flex-col">
      <div className="mx-auto flex h-screen w-full max-w-6xl gap-0 px-4 py-6 md:gap-6">
        {showSidebar && (
          <div className="h-full w-full md:w-[360px]">
            <Sidebar
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              users={users}
              onStartConversation={handleStartConversation}
              search={search}
              setSearch={setSearch}
              onSigningOut={() => setIsSigningOut(true)}
              onCreateGroup={() => setIsGroupCreateOpen(true)}
            />
          </div>
        )}

        {showChat && (
          <div className="flex h-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-glow">
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                isMobile={isMobile}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <EmptyState
                  title="Pick a conversation"
                  description="Select a chat on the left to view messages."
                />
              </div>
            )}
          </div>
        )}
      </div>
      {isSigningOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-700 shadow-glow">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
            Signing out...
          </div>
        </div>
      )}

      <GroupCreate
        isOpen={isGroupCreateOpen}
        onClose={() => setIsGroupCreateOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
