import { Response } from "@/lib/supabase/entity.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateResponsePayload = {
  chat_id: number;
  message?: string | null;
  image_url: string[];
};

export function useCreateResponse() {
  const queryClient = useQueryClient();

  return useMutation<Response, Error, CreateResponsePayload>({
    mutationFn: async (responseData) => {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create response");
      }

      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      queryClient.invalidateQueries({
        queryKey: ["responses", response.chat_id],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}
