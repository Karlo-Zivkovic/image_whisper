"use client";

import { Button } from "@/components/ui/button";
import { useGetClientChats } from "../hooks/useGetClientChats";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatSidebarProps {
  selectedChatId: number | null;
  onSelectChat: (chatId: number) => void;
}

export default function ChatSidebar({
  selectedChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const { data: clientGroups, isLoading } = useGetClientChats();
  const [expandedClients, setExpandedClients] = useState<Set<number>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedChatId && clientGroups) {
      // Find the client that contains the selected chat
      const clientWithSelectedChat = clientGroups.find((group) =>
        group.chats.some((chat) => chat.chatId === selectedChatId)
      );

      if (clientWithSelectedChat) {
        setExpandedClients((prev) => {
          const newSet = new Set(prev);
          newSet.add(clientWithSelectedChat.clientId);
          return newSet;
        });
      }
    }
  }, [selectedChatId, clientGroups]);

  const toggleClient = (clientId: number) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // Filter clients and chats based on search query
  const filteredClientGroups = clientGroups?.filter(
    (client) =>
      searchQuery === "" ||
      `Client ${client.clientId}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      client.chats.some((chat) =>
        `Chat ${chat.chatId}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">
            Client Images & Queries
          </h2>
          <div className="animate-pulse h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b bg-white">
        <h2 className="text-lg font-semibold mb-3">Client Images & Queries</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search clients and chats"
            className="pl-9 pr-4 py-2 w-full bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clients and chats list */}
      <div className="overflow-y-auto flex-1">
        <div className="divide-y divide-gray-100">
          {filteredClientGroups && filteredClientGroups.length > 0 ? (
            filteredClientGroups.map((clientGroup) => (
              <div key={clientGroup.clientId} className="py-1">
                {/* Client header */}
                <Button
                  variant="ghost"
                  className="w-full justify-between px-4 py-3 font-medium text-left h-auto hover:bg-gray-100"
                  onClick={() => toggleClient(clientGroup.clientId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <span>Client {clientGroup.clientId}</span>
                  </div>
                  {expandedClients.has(clientGroup.clientId) ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  )}
                </Button>

                {/* Chat list for this client */}
                {(expandedClients.has(clientGroup.clientId) || searchQuery) && (
                  <div className="pl-6 pr-2 space-y-0.5">
                    {clientGroup.chats
                      .filter(
                        (chat) =>
                          searchQuery === "" ||
                          `Chat ${chat.chatId}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((chat) => (
                        <Button
                          key={`${chat.chatId}-${chat.clientId}`}
                          variant={
                            selectedChatId === chat.chatId ? "default" : "ghost"
                          }
                          size="sm"
                          className={`w-full justify-start py-2 my-1 rounded-md ${
                            selectedChatId === chat.chatId
                              ? "bg-primary/10 text-primary hover:bg-primary/15"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => onSelectChat(chat.chatId)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-gray-600" />
                            </div>
                            <span>Chat {chat.chatId}</span>
                          </div>
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {searchQuery ? "No matching chats found" : "No chats found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
