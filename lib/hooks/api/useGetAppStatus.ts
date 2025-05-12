import { AppStatus } from "@/lib/supabase/entity.types";
import { useQuery } from "@tanstack/react-query";

export function useGetAppStatus() {
  return useQuery<AppStatus>({
    queryKey: ["app_status"],
    queryFn: async () => {
      const response = await fetch("/api/app-status");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch app status");
      }

      return response.json();
    },
  });
}
