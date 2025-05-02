import { Response } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

type CreateResponsePayload = {
  chat_id: number;
  message?: string | null;
  image_url: string[];
};

export function useCreateResponse() {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, CreateResponsePayload>({
    mutationFn: async (responseData) => {
      const { data, error } = await supabase
        .from("responses")
        .insert(responseData)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create response");

      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      queryClient.invalidateQueries({
        queryKey: ["responses", response.chat_id],
      });

      // Also update the associated chat
      supabase
        .from("chats")
        .update({
          updated_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", response.chat_id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        });
    },
  });
}
