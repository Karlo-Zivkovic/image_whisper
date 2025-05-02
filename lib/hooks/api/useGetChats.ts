import { Chat } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";
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

      // Original Supabase query (commented out)
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
