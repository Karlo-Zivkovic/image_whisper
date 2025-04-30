"use client";

import { useGetChatMessages } from "../hooks/useGetChatMessages";
import ChatMessage from "./ChatMessage";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  User,
  ChevronLeft,
  Upload,
  MoreVertical,
} from "lucide-react";

interface ChatWindowProps {
  chatId: number | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: messages, isLoading } = useGetChatMessages(chatId);

  // Empty state - no chat selected
  if (!chatId) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 h-full">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Client Images & Queries
        </h3>
        <p className="text-muted-foreground">
          Select a chat to view client images and queries
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 h-full">
        <div className="border-b p-3 bg-gray-50 flex items-center">
          <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
          <div className="animate-pulse h-5 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-center h-full">
          <p className="animate-pulse">Loading messages...</p>
        </div>
      </div>
    );
  }

  // No messages state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 h-full">
        <ChatHeader chatId={chatId} clientId={null} />
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No messages in this chat</p>
        </div>
      </div>
    );
  }

  const clientId = messages[0].client_id;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader chatId={chatId} clientId={clientId} />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isWorkerResponse={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatHeader({
  chatId,
  clientId,
}: {
  chatId: number;
  clientId: number | null;
}) {
  return (
    <div className="border-b px-4 py-3 bg-white flex items-center justify-between">
      <div className="flex items-center">
        <div className="hidden sm:flex mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          <User className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">
            Client {clientId} - Chat {chatId}
          </div>
          <div className="text-xs text-gray-500">Client Images & Queries</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Upload className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
