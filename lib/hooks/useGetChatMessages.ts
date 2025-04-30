import { ClientQueries } from "@/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export function useGetChatMessages(chatId: number | null) {
  return useQuery<ClientQueries[]>({
    queryKey: ["chatMessages", chatId],
    queryFn: async () => {
      if (chatId === null) return [];

      const { data } = await supabase
        .from("client_queries")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      return data ?? [];
    },
    enabled: chatId !== null,
  });
}
