import { Chat } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
// import { mockChats } from "@/lib/mocks/mockChats";

export function useGetChats() {
  return useQuery<Chat[]>({
    queryKey: ["chats"],
    queryFn: async () => {
      // Mock API call with a delay to simulate network request
      // return new Promise<Chat[]>((resolve) => {
      //   setTimeout(() => {
      //     // Return the mock data sorted by updated_at (newest first)
      //     const sortedChats = [...mockChats].sort(
      //       (a, b) =>
      //         new Date(b.updated_at).getTime() -
      //         new Date(a.updated_at).getTime()
      //     );
      //     resolve(sortedChats);
      //   }, 500); // 500ms delay to simulate API call
      // });

      const response = await fetch("/api/chats");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch chats");
      }

      return response.json();
    },
  });
}
