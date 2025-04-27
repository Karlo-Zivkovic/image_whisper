import { ClientQueries } from "@/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export function useGetClientQueries() {
  return useQuery<ClientQueries[]>({
    queryKey: ["clientQueries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("client_queries")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
