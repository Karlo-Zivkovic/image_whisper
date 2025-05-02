import { Request } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

type CreateRequestPayload = {
  chat_id: number;
  prompt: string;
  image_url: string;
};

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation<Request, Error, CreateRequestPayload>({
    mutationFn: async (requestData) => {
      const { data, error } = await supabase
        .from("requests")
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create request");

      return data;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({
        queryKey: ["requests", request.chat_id],
      });

      // Also update the associated chat
      supabase
        .from("chats")
        .update({
          updated_at: new Date().toISOString(),
          status: "processing",
        })
        .eq("id", request.chat_id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["chats"] });
        });
    },
  });
}
