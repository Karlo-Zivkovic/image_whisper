"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative">
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

      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 absolute md:relative z-10 h-full w-full md:w-[320px] 
        bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out md:transition-none`}
      >
        <ChatSidebar
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Main content - full width on mobile */}
      <div
        className={`flex-1 flex flex-col h-full transition-transform duration-200 ease-in-out
        ${mobileSidebarOpen ? "opacity-50 md:opacity-100" : "opacity-100"}`}
      >
        <ChatWindow chatId={selectedChatId} />
      </div>

      {/* Backdrop overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden absolute inset-0 bg-black bg-opacity-25 z-0"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
