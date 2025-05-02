import { supabase } from "@/lib/supabase";
import { Response } from "@/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";

export function useGetResponses(chatId: number | null) {
  return useQuery<Response[]>({
    queryKey: ["responses", chatId],
    queryFn: async () => {
      if (chatId === null) return [];

      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: chatId !== null,
  });
}
