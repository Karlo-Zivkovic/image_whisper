"use client";

import { useGetChats } from "../../hooks/api/useGetChats";
import { useRef } from "react";
import { MessageSquare } from "lucide-react";
import MessageDisplay from "./MessageDisplay";
import ResponseInput from "./ResponseInput";
import { useChatMessages } from "../../hooks/useChatMessages";
import { useImageUpload } from "../../hooks/useImageUpload";

export type ResponseFormValues = {
  message: string;
};

interface ChatWindowProps {
  chatId: number | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: chats } = useGetChats();
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Get chat info
  const currentChat = chats?.find((chat) => chat.id === chatId);
  const userId = currentChat?.user_id;

  // Use custom hooks
  const { conversationThreads, isLoading, latestRequest, refetchResponses } =
    useChatMessages(chatId);

  // Get image upload functionality
  const {
    imagePreviews,
    removeImage,
    form,
    fileInputRef,
    isSubmitting,
    isUploading,
    uploadedImages,
    onSubmit,
    handleFileSelect,
  } = useImageUpload(chatId || 0, refetchResponses);

  // Empty state - no chat selected
  if (!chatId) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-gray-50 h-full">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          AI Image Generation
        </h3>
        <p className="text-muted-foreground">
          Select a chat to view requests and responses
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
          <p className="animate-pulse">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // No requests state
  if (!latestRequest) {
    return (
      <div className="flex flex-col flex-1 h-full">
        <div className="border-b p-3 bg-white flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Chat {chatId}</h2>
            {userId && <p className="text-xs text-gray-500">User {userId}</p>}
          </div>
        </div>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No requests in this chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="border-b p-3 bg-white flex items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Chat {chatId}</h2>
          {userId && <p className="text-xs text-gray-500">User {userId}</p>}
        </div>
      </div>

      {/* Message Display Component */}
      <MessageDisplay
        conversationThreads={conversationThreads}
        chatWindowRef={chatWindowRef}
        imagePreviews={imagePreviews}
        removeImage={removeImage}
      />

      {/* Response Input Component */}
      <ResponseInput
        form={form}
        fileInputRef={fileInputRef}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        uploadedImages={uploadedImages}
        handleFileSelect={handleFileSelect}
        onSubmit={onSubmit}
      />
    </div>
  );
}
