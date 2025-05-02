import { Request } from "@/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

export function useGetRequests(chatId: number | null) {
  return useQuery<Request[]>({
    queryKey: ["requests", chatId],
    queryFn: async () => {
      if (chatId === null) return [];

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: chatId !== null,
  });
}
