import { Chat } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

type CreateChatPayload = {
  user_id: number;
  status: string;
};

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, CreateChatPayload>({
    mutationFn: async (chatData) => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("chats")
        .insert({
          ...chatData,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to create chat");

      return data;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", chat.user_id] });
    },
  });
}
