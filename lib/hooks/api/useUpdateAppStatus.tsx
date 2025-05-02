import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppStatus } from "@/lib/supabase/entity.types";
import { supabase } from "../../supabase/supabase";

export function useUpdateAppStatus() {
  const queryClient = useQueryClient();

  return useMutation<AppStatus, Error, Partial<AppStatus>>({
    mutationFn: async (appStatus) => {
      if (!appStatus.id) throw new Error("App status ID is required");

      const { data, error } = await supabase
        .from("app_status")
        .update(appStatus)
        .eq("id", appStatus.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to update app status");

      return data;
    },
    onSuccess: (appStatus) => {
      queryClient.invalidateQueries({ queryKey: ["app_status"] });
      queryClient.invalidateQueries({
        queryKey: ["app_status", appStatus.id],
      });
    },
  });
}
