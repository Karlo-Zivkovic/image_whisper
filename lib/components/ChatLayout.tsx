"use client";

import { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import Sidebar from "./Sidebar/Sidebar";

export default function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close sidebar when chat is selected on mobile
  useEffect(() => {
    if (selectedChatId && mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [selectedChatId, mobileSidebarOpen]);

  // Handle resize events to close sidebar on desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative">
      {/* Sidebar Component */}
      <Sidebar
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main content - full width on mobile */}
      <div
        className={`flex-1 flex flex-col h-full transition-transform duration-200 ease-in-out
        ${mobileSidebarOpen ? "opacity-50 md:opacity-100" : "opacity-100"}`}
      >
        <ChatWindow chatId={selectedChatId} />
      </div>
    </div>
  );
}
