import { useState, useCallback, useEffect, useRef } from "react";
import { useSupabaseImageUpload } from "@/lib/hooks/useSupabaseImageUpload";
import { supabase } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { ResponseFormValues } from "../components/ChatWindow/ChatWindow";

export function useImageUpload(chatId: number, refetchResponses: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { uploadImage, loading: isUploading } = useSupabaseImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResponseFormValues>({
    defaultValues: {
      message: "",
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      if (uploadedImages.length >= 3) return;

      const remainingSlots = 3 - uploadedImages.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);

      if (filesToAdd.length === 0) return;

      setUploadedImages((prev) => [...prev, ...filesToAdd]);

      // Generate previews for the images
      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [uploadedImages]
  );

  // Handle paste events for clipboard images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (uploadedImages.length >= 3) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect([file]);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleFileSelect, uploadedImages.length]);

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: ResponseFormValues) {
    if (!chatId) return;

    try {
      setIsSubmitting(true);

      // Upload images to Supabase Storage
      const uploadedUrls: string[] = [];

      if (uploadedImages.length > 0) {
        for (const file of uploadedImages) {
          const { url, error } = await uploadImage(file);
          if (error) {
            console.error("Error uploading image:", error);
            continue;
          }
          if (url) {
            uploadedUrls.push(url);
          }
        }
      }

      // Prepare the response data
      const responseData = {
        chat_id: chatId,
        message: data.message,
        image_url: uploadedUrls,
        created_at: new Date().toISOString(),
      };

      // Insert the response into the database
      const { error } = await supabase.from("responses").insert(responseData);

      if (error) {
        console.error("Error submitting response:", error);
        return;
      }

      // Just refetch responses after submitting
      refetchResponses();

      // Clear the form and image state
      setUploadedImages([]);
      setImagePreviews([]);

      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    fileInputRef,
    isSubmitting,
    isUploading,
    uploadedImages,
    imagePreviews,
    onSubmit,
    handleFileSelect,
    removeImage,
  };
}
