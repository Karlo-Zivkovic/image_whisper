import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientQueries } from "@/supabase/entity.types";
import { supabase } from "../supabase";

export function useUpdateClientQueries() {
  const queryClient = useQueryClient();

  return useMutation<ClientQueries, Error, Partial<ClientQueries>>({
    mutationFn: async (clientQuery) => {
      if (!clientQuery.id) throw new Error("Client query ID is required");

      const { data, error } = await supabase
        .from("client_queries")
        .update(clientQuery)
        .eq("id", clientQuery.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to update client query");

      return data;
    },
    onSuccess: (clientQuery) => {
      queryClient.invalidateQueries({ queryKey: ["client_queries"] });
      queryClient.invalidateQueries({
        queryKey: ["client_query", clientQuery.id],
      });
    },
  });
}
