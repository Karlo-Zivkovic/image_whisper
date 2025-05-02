import { Chat } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

type UpdateChatPayload = Partial<Omit<Chat, "id" | "created_at">> & {
  id: number;
};

export function useUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, UpdateChatPayload>({
    mutationFn: async (chatData) => {
      const { id, ...updateData } = chatData;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("chats")
        .update({
          ...updateData,
          updated_at: now,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to update chat");

      return data;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", chat.user_id] });
    },
  });
}
