import { Request } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";

export function useGetRequests(chatId: number | null) {
  return useQuery<Request[]>({
    queryKey: ["requests", chatId],
    queryFn: async () => {
      if (chatId === null) return [];

      const response = await fetch(`/api/requests?chatId=${chatId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch requests");
      }

      return response.json();
    },
    enabled: chatId !== null,
  });
}
