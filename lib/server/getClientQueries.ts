import { supabase } from "../supabase";
import { ClientQueries } from "@/supabase/entity.types";

export async function getClientQueries(): Promise<ClientQueries[]> {
  const { data } = await supabase
    .from("client_queries")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClientQueriesGroupedByChat(): Promise<{
  [chatId: string]: ClientQueries[];
}> {
  const { data } = await supabase
    .from("client_queries")
    .select("*")
    .order("created_at", { ascending: true });

  const queriesByChat: { [chatId: string]: ClientQueries[] } = {};

  if (data) {
    data.forEach((query) => {
      const chatId = query.chat_id.toString();
      if (!queriesByChat[chatId]) {
        queriesByChat[chatId] = [];
      }
      queriesByChat[chatId].push(query);
    });
  }

  return queriesByChat;
}

export async function getClientChats(): Promise<
  { chatId: number; clientId: number }[]
> {
  const { data } = await supabase
    .from("client_queries")
    .select("chat_id, client_id")
    .order("created_at", { ascending: false });

  if (!data) return [];

  // Get unique chat_id and client_id combinations
  const uniqueChats = Array.from(
    new Set(data.map((item) => `${item.chat_id}-${item.client_id}`))
  ).map((combined) => {
    const [chatId, clientId] = combined.split("-").map(Number);
    return { chatId, clientId };
  });

  return uniqueChats;
}
