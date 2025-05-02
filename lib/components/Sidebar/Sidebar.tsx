"use client";

import { useGetChats } from "@/lib/hooks/api/useGetChats";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatFilters } from "@/lib/hooks/useChatFilters";
import { ChatFilters } from "./ChatFilters";
import { ChatListItem } from "./ChatListItem";
import { AppStatusControl } from "./AppStatusControl";

interface SidebarProps {
  selectedChatId: number | null;
  onSelectChat: (chatId: number) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  selectedChatId,
  onSelectChat,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: SidebarProps) {
  const { data: chats, isLoading } = useGetChats();

  // Use the custom hook for filtering chats
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredChats,
  } = useChatFilters(chats, selectedChatId, onSelectChat);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden absolute top-2 left-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white shadow-sm"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 absolute md:relative z-10 h-full w-full md:w-[320px] 
        bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:transition-none flex flex-col`}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Chats</h2>

          {/* Use the ChatFilters component */}
          <ChatFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-4 text-gray-500">Loading chats...</div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onClick={() => onSelectChat(chat.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No matching chats found"
                : "No chats found"}
            </div>
          )}
        </div>

        {/* App status control at the bottom */}
        <AppStatusControl />
      </div>

      {/* Backdrop overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden absolute inset-0 bg-black bg-opacity-25 z-0"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}
