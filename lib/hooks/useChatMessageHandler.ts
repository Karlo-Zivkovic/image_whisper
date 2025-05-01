import { useState, useRef, useCallback } from "react";
import { ClientQueries } from "@/supabase/entity.types";
import { formatDate } from "@/lib/utils";
import { useSupabaseImageUpload } from "./useSupabaseImageUpload";
import { useUpdateClientQueries } from "./useUpdateClientQueries";

export const MAX_IMAGES = 3;

export function useChatMessageHandler(message: ClientQueries) {
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

  // State to track locally updated message
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

  // Upload handler
  const handleUpload = async () => {
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
  };

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

  // Toggle the expanded state and focus the paste area
  const toggleExpanded = (value?: boolean) => {
    const newValue = value !== undefined ? value : !expanded;
    setExpanded(newValue);
    if (newValue) {
      setTimeout(focusPasteArea, 100);
    }
  };

  return {
    // State
    expanded,
    files,
    uploadLoading,
    uploadError,
    pasteError,
    isUploading,
    currentMessage,
    responseUrls,
    hasResponse,
    queryImageUrl,
    messageTime,
    pasteAreaRef,

    // Methods
    setExpanded,
    toggleExpanded,
    handleUpload,
    handlePaste,
    handleDrop,
    handleDragOver,
    handleFileSelect,
    removeFile,
    focusPasteArea,
  };
}
