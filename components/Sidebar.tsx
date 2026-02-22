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
import { useState, useEffect } from "react";

type ConversationSummary = {
  _id: Id<"conversations">;
  title: string;
  subtitle: string;
  avatarUrl?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: number | null;
  unreadCount: number;
  isOnline?: boolean;
  isGroup?: boolean;
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
  onCreateGroup,
}: {
  conversations: ConversationSummary[] | undefined;
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
  users: UserSummary[] | undefined;
  onStartConversation: (id: Id<"users">) => void;
  search: string;
  setSearch: (value: string) => void;
  onSigningOut?: () => void;
  onCreateGroup?: () => void;
}) {
  const { signOut } = useClerk();
  const me = useQuery(api.users.getMe);
  const setOffline = useMutation(api.presence.setOffline);
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const directMessages = conversations?.filter((c) => !c.isGroup) ?? [];
  const groups = conversations?.filter((c) => c.isGroup) ?? [];

  return (
    <aside className="flex h-full flex-col gap-4 border-r border-white/60 bg-white/70 p-5 shadow-glow">
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

      {/* Tabs for Chats and Groups */}
      <div className="flex gap-2 border-b border-ink-200">
        <button
          onClick={() => setActiveTab("chats")}
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-semibold transition border-b-2 -mb-1",
            activeTab === "chats"
              ? "border-mint-500 text-mint-600"
              : "border-transparent text-ink-500 hover:text-ink-700",
          )}
        >
          <span>💬</span> Chats
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-semibold transition border-b-2 -mb-1",
            activeTab === "groups"
              ? "border-mint-500 text-mint-600"
              : "border-transparent text-ink-500 hover:text-ink-700",
          )}
        >
          <span>👥</span> Groups
        </button>
      </div>

      {/* Chats Tab */}
      {activeTab === "chats" && (
        <section className="flex flex-col gap-3 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Direct Messages
          </p>
          {!conversations && (
            <p className="text-sm text-ink-500">Loading chats...</p>
          )}
          {conversations && directMessages.length === 0 && (
            <EmptyState
              title="No chats yet"
              description="Find a teammate to start chatting."
            />
          )}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {directMessages.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition",
                  selectedConversationId === conversation._id
                    ? "border-mint-300 bg-mint-50"
                    : "hover:border-ink-200 hover:bg-white",
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
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      selectedConversationId === conversation._id
                        ? "text-ink-900"
                        : "text-ink-800",
                    )}
                  >
                    {conversation.title}
                  </p>
                  <ConversationSubtitle
                    conversationId={conversation._id}
                    lastMessage={conversation.lastMessage}
                    subtitle={conversation.subtitle}
                    now={now}
                    isGroup={false}
                  />
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {conversation.lastMessageAt && (
                    <span
                      className={cn(
                        "text-[10px]",
                        selectedConversationId === conversation._id
                          ? "text-ink-600"
                          : "text-ink-400",
                      )}
                    >
                      {formatMessageTime(conversation.lastMessageAt)}
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge value={conversation.unreadCount} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <section className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Group Chats
            </p>
            <button
              type="button"
              onClick={() => onCreateGroup?.()}
              className="rounded-full border border-ink-200 px-2 py-0.5 text-xs font-semibold text-ink-700 hover:bg-white transition"
              title="Create group"
            >
              +
            </button>
          </div>
          {!conversations && (
            <p className="text-sm text-ink-500">Loading groups...</p>
          )}
          {conversations && groups.length === 0 && (
            <EmptyState
              title="No groups yet"
              description="Create a group to start group chatting."
            />
          )}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {groups.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition",
                  selectedConversationId === conversation._id
                    ? "border-mint-300 bg-mint-50"
                    : "hover:border-ink-200 hover:bg-white",
                )}
              >
                <div className="relative">
                  <Avatar
                    src={conversation.avatarUrl}
                    alt={conversation.title}
                    size={44}
                  />
                  <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-mint-400 flex items-center justify-center text-xs">
                    👥
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      selectedConversationId === conversation._id
                        ? "text-ink-900"
                        : "text-ink-800",
                    )}
                  >
                    {conversation.title}
                  </p>
                  <ConversationSubtitle
                    conversationId={conversation._id}
                    lastMessage={conversation.lastMessage}
                    subtitle={conversation.subtitle}
                    now={now}
                    isGroup={true}
                  />
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {conversation.lastMessageAt && (
                    <span
                      className={cn(
                        "text-[10px]",
                        selectedConversationId === conversation._id
                          ? "text-ink-600"
                          : "text-ink-400",
                      )}
                    >
                      {formatMessageTime(conversation.lastMessageAt)}
                    </span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge value={conversation.unreadCount} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Find People Section */}
      <section className="flex flex-1 flex-col gap-2 overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Find people
        </p>
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

function ConversationSubtitle({
  conversationId,
  lastMessage,
  subtitle,
  now,
  isGroup,
}: {
  conversationId: Id<"conversations">;
  lastMessage?: string | null;
  subtitle: string;
  now: number;
  isGroup?: boolean;
}) {
  const typingUsers = useQuery(api.typing.list, { conversationId, now });

  if (typingUsers && typingUsers.length > 0) {
    let typingLabel: string;

    if (isGroup) {
      // In groups, show who is typing
      typingLabel =
        typingUsers.length === 1
          ? `${typingUsers[0].name} is typing...`
          : "Multiple people are typing...";
    } else {
      // In 1-on-1 chats, just show typing
      typingLabel = "typing...";
    }

    return (
      <p className="text-xs text-mint-600 font-semibold italic flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint-400 animate-pulse" />
        {typingLabel}
      </p>
    );
  }

  return <p className="text-xs text-ink-500">{lastMessage ?? subtitle}</p>;
}
