import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppStatus } from "@/lib/supabase/entity.types";

export function useUpdateAppStatus() {
  const queryClient = useQueryClient();

  return useMutation<AppStatus, Error, Partial<AppStatus>>({
    mutationFn: async (appStatus) => {
      if (!appStatus.id) throw new Error("App status ID is required");

      const response = await fetch("/api/app-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appStatus),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update app status");
      }

      return response.json();
    },
    onSuccess: (appStatus) => {
      queryClient.invalidateQueries({ queryKey: ["app_status"] });
      queryClient.invalidateQueries({
        queryKey: ["app_status", appStatus.id],
      });
    },
  });
}
