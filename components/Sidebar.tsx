"use client";

import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { EmptyState } from "./EmptyState";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ConversationSummary = {
  _id: Id<"conversations">;
  title: string;
  subtitle: string;
  avatarUrl?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: number | null;
  unreadCount: number;
  isOnline?: boolean;
};

type UserSummary = {
  _id: Id<"users">;
  name: string;
  imageUrl?: string | null;
  isOnline?: boolean;
};

export function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  users,
  onStartConversation,
  search,
  setSearch,
  onSigningOut,
}: {
  conversations: ConversationSummary[] | undefined;
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  users: UserSummary[] | undefined;
  onStartConversation: (id: Id<"users">) => void;
  search: string;
  setSearch: (value: string) => void;
  onSigningOut?: () => void;
}) {
  const { signOut } = useClerk();
  const me = useQuery(api.users.getMe);
  const setOffline = useMutation(api.presence.setOffline);

  return (
    <aside className="flex h-full flex-col gap-6 border-r border-white/60 bg-white/70 p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={me?.imageUrl} alt={me?.name ?? "You"} size={42} />
          <div>
            <p className="text-sm font-semibold text-ink-800">
              {me?.name ?? "Loading..."}
            </p>
            <p className="text-xs text-ink-500">Welcome back</p>
          </div>
        </div>
        <button
          onClick={async () => {
            onSigningOut?.();
            await setOffline({});
            await signOut();
          }}
          className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700"
        >
          Sign out
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Conversations
          </p>
        </div>
        {!conversations && (
          <p className="text-sm text-ink-500">Loading conversations...</p>
        )}
        {conversations && conversations.length === 0 && (
          <EmptyState
            title="No conversations yet"
            description="Find a teammate to start chatting."
          />
        )}
        <div className="flex flex-col gap-2">
          {conversations?.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition",
                selectedConversationId === conversation._id
                  ? "border-ink-200 bg-ink-900 text-white"
                  : "hover:border-ink-200 hover:bg-white"
              )}
            >
              <div className="relative">
                <Avatar
                  src={conversation.avatarUrl}
                  alt={conversation.title}
                  size={44}
                />
                {conversation.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-mint-400" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    selectedConversationId === conversation._id
                      ? "text-white"
                      : "text-ink-800"
                  )}
                >
                  {conversation.title}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    selectedConversationId === conversation._id
                      ? "text-white/70"
                      : "text-ink-500"
                  )}
                >
                  {conversation.lastMessage ?? conversation.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {conversation.lastMessageAt && (
                  <span
                    className={cn(
                      "text-[11px]",
                      selectedConversationId === conversation._id
                        ? "text-white/70"
                        : "text-ink-400"
                    )}
                  >
                    {formatMessageTime(conversation.lastMessageAt)}
                  </span>
                )}
                <Badge value={conversation.unreadCount} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Find people
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name..."
          className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-500"
        />
        {!users && <p className="text-sm text-ink-500">Loading users...</p>}
        {users && users.length === 0 && (
          <EmptyState
            title="No results"
            description="Try searching with a different name."
          />
        )}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {users?.map((user) => (
            <button
              key={user._id}
              onClick={() => onStartConversation(user._id)}
              className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition hover:border-ink-200 hover:bg-white"
            >
              <div className="relative">
                <Avatar src={user.imageUrl} alt={user.name} size={40} />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-mint-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-800">
                  {user.name}
                </p>
                <p className="text-xs text-ink-500">
                  {user.isOnline ? "Online now" : "Offline"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
