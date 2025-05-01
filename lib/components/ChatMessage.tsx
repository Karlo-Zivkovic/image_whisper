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
  X,
  Plus,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  error: "bg-red-100 text-red-800 border-red-200",
};

const MAX_IMAGES = 3;

export default function ChatMessage({ message }: { message: ClientQueries }) {
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

  // Ensure chatgpt_response_url is always treated as an array
  const responseUrls = Array.isArray(currentMessage.chatgpt_response_url)
    ? currentMessage.chatgpt_response_url
    : currentMessage.chatgpt_response_url
    ? [currentMessage.chatgpt_response_url]
    : [];

  // Check if we have any response images
  const hasResponse = responseUrls.length > 0;

  // For query image, ensure it's handled properly
  const queryImageUrl = Array.isArray(currentMessage.image_url)
    ? currentMessage.image_url[0]
    : currentMessage.image_url;

  const messageTime = formatDate(currentMessage.created_at).split(",")[0];

  async function handleUpload() {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload each file and get urls
      const uploadPromises = files.map((file) => uploadImage(file));
      const results = await Promise.all(uploadPromises);

      // Filter out any failed uploads and extract urls
      const urls = results
        .filter((result) => result.url !== null)
        .map((result) => result.url as string);

      if (urls.length > 0) {
        // Combine with existing urls if any
        const newUrls = [...responseUrls, ...urls].slice(0, MAX_IMAGES);

        // Update the local state immediately for UI
        setLocalMessage({
          ...currentMessage,
          chatgpt_response_url: newUrls,
          status: "completed",
        });

        // Update the database
        updateMessage({
          id: currentMessage.id,
          chatgpt_response_url: newUrls,
          status: "completed",
        });

        // Reset state
        setFiles([]);
        setExpanded(false);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  }

  // Handler for pasting image from clipboard
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      setPasteError(null);
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // Check if we're at the maximum image count
            if (files.length >= MAX_IMAGES) {
              setPasteError(`Maximum of ${MAX_IMAGES} images allowed.`);
              return;
            }

            setFiles((prev) => [...prev, blob]);
            e.preventDefault();
            return;
          }
        }
      }

      setPasteError("No image found in clipboard. Try copying an image first.");
    },
    [files]
  );

  // Handler for drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setPasteError(null);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Check if adding these files would exceed the maximum
        if (files.length + e.dataTransfer.files.length > MAX_IMAGES) {
          setPasteError(`Maximum of ${MAX_IMAGES} images allowed.`);
          return;
        }

        const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.startsWith("image/")
        );

        if (newFiles.length === 0) {
          setPasteError("The dropped files are not images.");
          return;
        }

        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [files]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle file selection from input
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      // Check if adding these files would exceed the maximum
      if (files.length + e.target.files.length > MAX_IMAGES) {
        setPasteError(`Maximum of ${MAX_IMAGES} images allowed.`);
        return;
      }

      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    },
    [files]
  );

  // Remove a file from the selection
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

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
          {queryImageUrl && (
            <div className="relative w-full h-[280px] mb-3 bg-gray-50 rounded">
              <Image
                src={queryImageUrl}
                alt="Query image"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="rounded object-contain"
              />
            </div>
          )}

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

            {/* Response Images Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {responseUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-full h-[200px] bg-gray-50 rounded overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Response image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded object-contain"
                  />
                </div>
              ))}

              {/* Add image button if we have less than MAX_IMAGES */}
              {responseUrls.length < MAX_IMAGES && (
                <Button
                  variant="outline"
                  className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded"
                  onClick={() => {
                    setExpanded(true);
                    setTimeout(focusPasteArea, 100);
                  }}
                >
                  <Plus className="h-6 w-6 mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500">Add Image</span>
                </Button>
              )}
            </div>

            {/* Response time and status */}
            <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
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

        {/* Upload Response UI - Show if no response yet or explicitly expanded */}
        {(!hasResponse || expanded) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {!expanded && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={() => {
                  setExpanded(true);
                  setTimeout(focusPasteArea, 100);
                }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {isUploading ? "Uploading..." : "Upload Response"}
              </Button>
            )}

            {expanded && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Upload response images (up to {MAX_IMAGES})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview of selected files */}
                {files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 my-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative group bg-gray-100 rounded-md h-20"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

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
                      files.length > 0
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  style={{ minHeight: "80px" }}
                  aria-disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mb-1" />
                      <p className="text-primary">Uploading images...</p>
                    </div>
                  ) : (
                    <>
                      <Clipboard className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                      {files.length > 0 ? (
                        <p className="text-green-600">
                          {files.length}{" "}
                          {files.length === 1 ? "image" : "images"} ready
                        </p>
                      ) : (
                        <p className="text-gray-500">
                          Click here to paste an image or drag and drop
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
                      multiple
                      onChange={handleFileSelect}
                      disabled={
                        isUploading ||
                        uploadLoading ||
                        files.length >= MAX_IMAGES
                      }
                      className="text-xs"
                    />
                  </>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading || uploadLoading}
                  size="sm"
                  className="w-full text-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${files.length} ${
                      files.length === 1 ? "Image" : "Images"
                    }`
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
