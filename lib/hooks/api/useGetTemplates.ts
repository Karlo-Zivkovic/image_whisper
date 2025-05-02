import { Template } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";

export function useGetTemplates(enabledOnly: boolean = false) {
  return useQuery<Template[]>({
    queryKey: ["templates", enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from("templates")
        .select("*")
        .order("name", { ascending: true });

      if (enabledOnly) {
        query = query.eq("is_enabled", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data ?? [];
    },
  });
}
