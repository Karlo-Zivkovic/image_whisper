import { useMemo, useState, useEffect } from "react";
import { Chat } from "@/lib/supabase/entity.types";

// Define chat status options
export type ChatStatus = "all" | "pending" | "completed" | "in_progress";

interface UseChatFiltersResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: ChatStatus;
  setStatusFilter: (status: ChatStatus) => void;
  filteredChats: Chat[];
}

export function useChatFilters(
  chats: Chat[] | undefined,
  selectedChatId: number | null,
  onSelectChat: (chatId: number) => void
): UseChatFiltersResult {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChatStatus>("pending");

  // Filter and sort chats
  const filteredChats = useMemo(() => {
    if (!chats) return [];

    // First filter by search term (user_id)
    let filtered = chats.filter((chat) =>
      searchTerm ? chat.user_id?.toString().includes(searchTerm) : true
    );

    // Then filter by status (if not 'all')
    if (statusFilter !== "all") {
      filtered = filtered.filter((chat) => chat.status === statusFilter);
    }

    // Sort by created_at (oldest first)
    return filtered.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [chats, searchTerm, statusFilter]);

  // Set first pending chat as selected if nothing is selected
  useEffect(() => {
    if (
      !selectedChatId &&
      filteredChats.length > 0 &&
      statusFilter === "pending"
    ) {
      const firstPendingChat = filteredChats.find(
        (chat) => chat.status === "pending"
      );
      if (firstPendingChat) {
        onSelectChat(firstPendingChat.id);
      }
    }
  }, [filteredChats, selectedChatId, onSelectChat, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredChats,
  };
}
