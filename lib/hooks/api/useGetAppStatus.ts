import { AppStatus } from "@/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

export function useGetAppStatus() {
  return useQuery<AppStatus>({
    queryKey: ["app_status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_status")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error("No app status found");

      return data;
    },
  });
}
