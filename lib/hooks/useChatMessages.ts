import { useGetRequests } from "./api/useGetRequests";
import { useGetResponses } from "./api/useGetResponses";
import { useMemo } from "react";
import { Request, Response } from "@/lib/supabase/entity.types";

export function useChatMessages(chatId: number | null) {
  const { data: requests, isLoading: isLoadingRequests } =
    useGetRequests(chatId);

  const {
    data: responses,
    isLoading: isLoadingResponses,
    refetch: refetchResponses,
  } = useGetResponses(chatId);

  // Get the latest request
  const latestRequest =
    requests && requests.length > 0
      ? requests.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  // Group messages into conversation threads
  const conversationThreads = useMemo(() => {
    if (!requests) return [];

    const threads: { request: Request; response?: Response | null }[] = [];

    // Sort requests by created_at (oldest first)
    const sortedRequests = [...requests].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // For each request, find its corresponding response
    sortedRequests.forEach((request) => {
      const matchingResponse = responses?.find(
        (response) =>
          response.chat_id === chatId &&
          // We're assuming that responses are linked to requests by timing
          // In a real app, you might have a request_id in the response
          new Date(response.created_at).getTime() >
            new Date(request.created_at).getTime()
      );

      threads.push({
        request,
        response: matchingResponse,
      });
    });

    return threads;
  }, [requests, responses, chatId]);

  return {
    conversationThreads,
    isLoading: isLoadingRequests || isLoadingResponses,
    latestRequest,
    refetchResponses,
  };
}
