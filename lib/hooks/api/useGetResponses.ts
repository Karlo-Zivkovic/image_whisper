import { Response } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";

export function useGetResponses(chatId: number | null) {
  return useQuery<Response[]>({
    queryKey: ["responses", chatId],
    queryFn: async () => {
      if (chatId === null) return [];

      const response = await fetch(`/api/responses?chatId=${chatId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch responses");
      }

      return response.json();
    },
    enabled: chatId !== null,
  });
}
