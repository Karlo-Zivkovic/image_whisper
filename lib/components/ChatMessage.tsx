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
  MessageCircle,
  Loader2,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  error: "bg-red-100 text-red-800 border-red-200",
};

export default function ChatMessage({ message }: { message: ClientQueries }) {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const {
    uploadImage,
    loading: uploadLoading,
    error: uploadError,
  } = useSupabaseImageUpload();
  const { mutate: updateMessage } = useUpdateClientQueries();
  const [pasteError, setPasteError] = useState<string | null>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // New state to track locally updated message
  const [localMessage, setLocalMessage] = useState<ClientQueries>(message);
  const [isUploading, setIsUploading] = useState(false);

  // Use the local state or the prop, prioritizing local state for immediate UI updates
  const currentMessage = localMessage || message;
  const hasResponse = !!currentMessage.chatgpt_response_url;
  const messageTime = formatDate(currentMessage.created_at).split(",")[0];

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadImage(file);
      if (url) {
        // Update the local state immediately for UI
        setLocalMessage({
          ...currentMessage,
          chatgpt_response_url: url,
          status: "completed",
        });

        // Update the database
        updateMessage({
          id: currentMessage.id,
          chatgpt_response_url: url,
          status: "completed",
        });

        // Reset state
        setFile(null);
        setExpanded(false);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
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

  // Only rendering client query message now (with or without response)
  return (
    <div className="flex flex-col items-start w-full max-w-[95%] mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm w-full">
        {/* Query Section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-4 w-4 text-primary mr-2" />
            <h3 className="font-medium text-sm text-primary">Client Query</h3>
          </div>

          {/* Query Image */}
          <div className="relative w-full h-[280px] mb-3 bg-gray-50 rounded">
            <Image
              src={currentMessage.image_url}
              alt="Query image"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="rounded object-contain"
            />
          </div>

          {/* Query text */}
          {currentMessage.query_text && (
            <div className="mb-2 whitespace-pre-wrap">
              <p className="text-sm">{currentMessage.query_text}</p>
            </div>
          )}

          {/* Time and status */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>{messageTime}</span>
            <div className="flex items-center gap-1">
              {!hasResponse && (
                <>
                  {currentMessage.status === "completed" ? (
                    <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}

                  {/* Status Tag */}
                  {currentMessage.status && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full font-medium ${
                        STATUS_STYLES[currentMessage.status]
                      }`}
                    >
                      {currentMessage.status.charAt(0).toUpperCase() +
                        currentMessage.status.slice(1)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Response Section - Show if response exists */}
        {hasResponse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <CheckCheck className="h-4 w-4 text-blue-500 mr-2" />
              <h3 className="font-medium text-sm text-blue-600">
                Our Response
              </h3>
            </div>

            {/* Response Image */}
            <div className="relative w-full h-[280px] mb-3 bg-gray-50 rounded">
              <Image
                src={currentMessage.chatgpt_response_url!}
                alt="Response image"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="rounded object-contain"
              />
            </div>

            {/* Response time and status */}
            <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
              {/* <span>{messageTime}</span> */}
              <div className="flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES["completed"]}`}
                >
                  Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Response UI - Show if no response yet */}
        {!hasResponse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => {
                setExpanded((v) => !v);
                if (!expanded) setTimeout(focusPasteArea, 100);
              }}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {expanded
                ? "Hide"
                : isUploading
                ? "Uploading..."
                : "Upload Response"}
            </Button>

            {expanded && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
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
                  aria-disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mb-1" />
                      <p className="text-primary">Uploading image...</p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                  {pasteError && !isUploading && (
                    <p className="text-red-500 text-xs mt-1">{pasteError}</p>
                  )}
                </div>

                {!isUploading && (
                  <>
                    <p className="text-xs text-gray-500 my-1">- or -</p>

                    {/* File input */}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={isUploading || uploadLoading}
                      className="text-xs"
                    />
                  </>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading || uploadLoading}
                  size="sm"
                  className="w-full text-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </Button>
                {uploadError && !isUploading && (
                  <div className="text-red-600 text-xs">{uploadError}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
