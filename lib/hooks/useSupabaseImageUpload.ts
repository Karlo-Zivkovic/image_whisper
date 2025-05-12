import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export function useSupabaseImageUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImage(
    file: File
  ): Promise<{ url: string | null; error: string | null }> {
    setLoading(true);
    setError(null);
    const filename = `${uuidv4()}-${file.name}`;
    const filePath = `image_response/${filename}`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return { url: null, error: uploadError.message };
    }
    // Get public URL
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    setLoading(false);
    return { url: data.publicUrl, error: null };
  }

  return { uploadImage, loading, error };
}
