import { supabase } from "../supabase";
import { ClientQueries } from "@/supabase/entity.types";

export async function getClientQueries(): Promise<ClientQueries[]> {
  const { data } = await supabase
    .from("client_queries")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}
