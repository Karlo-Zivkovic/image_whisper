"use client";

import Image from "next/image";
import { ClientQueries } from "@/supabase/entity.types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";
import { useSupabaseImageUpload } from "@/lib/hooks/useSupabaseImageUpload";
import { Input } from "@/components/ui/input";
import { useUpdateClientQueries } from "../hooks/useUpdateClientQueries";
import {
  CheckCheck,
  Clock,
  Upload,
  Image as ImageIcon,
  Clipboard,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  error: "bg-red-100 text-red-800 border-red-200",
};

export default function ChatMessage({
  message,
  isWorkerResponse = false,
}: {
  message: ClientQueries;
  isWorkerResponse?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { uploadImage, loading, error } = useSupabaseImageUpload();
  const { mutate: updateMessage } = useUpdateClientQueries();
  const [pasteError, setPasteError] = useState<string | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  async function handleUpload() {
    if (!file) return;
    const { url } = await uploadImage(file);
    if (url) {
      // Update the chatgpt_response_url in the database
      updateMessage({
        id: message.id,
        chatgpt_response_url: url,
        status: "completed",
      });
    }
  }

  // Handler for pasting image from clipboard
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    setPasteError(null);
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          setFile(blob);
          e.preventDefault();
          return;
        }
      }
    }

    setPasteError("No image found in clipboard. Try copying an image first.");
  }, []);

  // Handler for drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setPasteError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setFile(file);
      } else {
        setPasteError("The dropped file is not an image.");
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Focus paste area when expanded
  const focusPasteArea = () => {
    if (pasteAreaRef.current) {
      pasteAreaRef.current.focus();
    }
  };

  // Determine if this message has a response
  const hasResponse = !!message.chatgpt_response_url;
  const messageTime = formatDate(message.created_at).split(",")[0];

  // Client query message
  if (!isWorkerResponse) {
    return (
      <div className="flex flex-col items-start max-w-[85%]">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          {/* Image */}
          <div className="relative w-full h-[220px] mb-2 bg-gray-50 rounded">
            <Image
              src={message.image_url}
              alt="Query image"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="rounded object-contain"
            />
          </div>

          {/* Query text */}
          {message.query_text && (
            <div className="mb-1 whitespace-pre-wrap">
              <p>{message.query_text}</p>
            </div>
          )}

          {/* Time and status */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <span>{messageTime}</span>
            <div className="flex items-center gap-1">
              {message.status === "completed" ? (
                <CheckCheck className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Status Tag */}
        {message.status && (
          <div
            className={`text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
              STATUS_STYLES[message.status]
            }`}
          >
            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
          </div>
        )}

        {/* Response actions */}
        {!hasResponse && (
          <div className="mt-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => {
                setExpanded((v) => !v);
                if (!expanded) setTimeout(focusPasteArea, 100);
              }}
            >
              <Upload className="h-3.5 w-3.5" />
              {expanded ? "Hide" : "Upload Response"}
            </Button>

            {expanded && (
              <div className="mt-2 p-3 bg-white rounded-lg shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Upload response image</span>
                </div>

                {/* Paste area */}
                <div
                  ref={pasteAreaRef}
                  tabIndex={0}
                  onPaste={handlePaste}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={focusPasteArea}
                  className={`border-2 border-dashed rounded-md p-4 text-center text-sm cursor-pointer
                    focus:outline-none focus:border-primary/50 transition-colors
                    ${
                      file
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  style={{ minHeight: "80px" }}
                >
                  <Clipboard className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                  {file ? (
                    <p className="text-green-600">
                      Image ready: {file.name || "Pasted image"}
                    </p>
                  ) : (
                    <p className="text-gray-500">
                      Click here and paste an image or drag and drop
                    </p>
                  )}
                  {pasteError && (
                    <p className="text-red-500 text-xs mt-1">{pasteError}</p>
                  )}
                </div>

                <p className="text-xs text-gray-500 my-1">- or -</p>

                {/* File input */}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={loading}
                  className="text-xs"
                />

                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  size="sm"
                  className="w-full text-xs"
                >
                  {loading ? "Uploading..." : "Upload Image"}
                </Button>
                {error && <div className="text-red-600 text-xs">{error}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Response message
  return (
    <div className="flex justify-end mb-4">
      <div className="bg-primary/10 rounded-lg p-2 shadow-sm max-w-[85%]">
        {/* Response Image */}
        <div className="relative w-full h-[220px] mb-2 bg-gray-50 rounded">
          <Image
            src={message.chatgpt_response_url!}
            alt="Response image"
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="rounded object-contain"
          />
        </div>

        {/* Time and status */}
        <div className="flex justify-end items-center text-xs text-gray-500 mt-1">
          <span>{messageTime}</span>
          <CheckCheck className="h-3.5 w-3.5 ml-1 text-blue-500" />
        </div>
      </div>
    </div>
  );
}
