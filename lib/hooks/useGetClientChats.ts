import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export type ClientChat = {
  chatId: number;
  clientId: number;
};

export type ClientChatsGroup = {
  clientId: number;
  chats: ClientChat[];
};

export function useGetClientChats() {
  return useQuery({
    queryKey: ["clientChats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("client_queries")
        .select("chat_id, client_id")
        .order("created_at", { ascending: false });

      if (!data) return [];

      // Get unique chat_id and client_id combinations
      const uniquePairs = Array.from(
        new Set(data.map((item) => `${item.chat_id}-${item.client_id}`))
      ).map((combined) => {
        const [chatId, clientId] = combined.split("-").map(Number);
        return { chatId, clientId };
      });

      // Group by client ID
      const groupedByClient: { [clientId: string]: ClientChat[] } = {};

      uniquePairs.forEach((pair) => {
        const clientIdStr = pair.clientId.toString();
        if (!groupedByClient[clientIdStr]) {
          groupedByClient[clientIdStr] = [];
        }
        groupedByClient[clientIdStr].push(pair);
      });

      // Convert to array of ClientChatsGroup
      const result: ClientChatsGroup[] = Object.entries(groupedByClient).map(
        ([clientIdStr, chats]) => ({
          clientId: parseInt(clientIdStr),
          chats: chats.sort((a, b) => a.chatId - b.chatId), // Sort chats by chatId
        })
      );

      // Sort by client ID
      return result.sort((a, b) => a.clientId - b.clientId);
    },
  });
}
