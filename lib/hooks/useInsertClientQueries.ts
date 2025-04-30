import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientQueries } from "@/supabase/entity.types";
import { supabase } from "../supabase";

export function useInsertClientQueries() {
  const queryClient = useQueryClient();

  return useMutation<ClientQueries, Error, ClientQueries>({
    mutationFn: async (clientQuery) => {
      const { data, error } = await supabase
        .from("client_queries")
        .insert(clientQuery)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to insert client query");

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
