import { Chat } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateChatPayload = Partial<Omit<Chat, "id" | "created_at">> & {
  id: number;
};

export function useUpdateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, UpdateChatPayload>({
    mutationFn: async (chatData) => {
      const { id, ...updateData } = chatData;

      const response = await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update chat");
      }

      return response.json();
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", chat.user_id] });
    },
  });
}
