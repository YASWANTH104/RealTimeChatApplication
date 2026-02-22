"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

export function GroupCreate({
  isOpen,
  onClose,
  onGroupCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: Id<"conversations">) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(),
  );
  const [isCreating, setIsCreating] = useState(false);

  const users = useQuery(api.users.list, { search: "" });
  const createGroup = useMutation(api.conversations.createGroup);

  const handleToggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.size < 1) {
      return;
    }

    setIsCreating(true);
    try {
      const conversationId = await createGroup({
        name: groupName,
        memberIds: Array.from(selectedMembers) as Id<"users">[],
      });
      onGroupCreated(conversationId);
      setGroupName("");
      setSelectedMembers(new Set());
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white/95 p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-ink-900">
          Create Group Chat
        </h2>

        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name..."
          className="mt-4 w-full rounded-full border border-ink-200 bg-white px-4 py-2 text-sm outline-none focus:border-ink-500"
        />

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
          Select Members
        </p>

        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {!users && <p className="text-sm text-ink-500">Loading users...</p>}
          {users?.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => handleToggleMember(user._id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                selectedMembers.has(user._id)
                  ? "border-ink-500 bg-ink-50"
                  : "border-transparent hover:bg-white",
              )}
            >
              <input
                type="checkbox"
                checked={selectedMembers.has(user._id)}
                onChange={() => { }}
                className="w-4 h-4"
              />
              <Avatar src={user.imageUrl} alt={user.name} size={32} />
              <span className="flex-1 text-sm font-semibold text-ink-800">
                {user.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={
              isCreating || !groupName.trim() || selectedMembers.size < 1
            }
            className="flex-1 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
