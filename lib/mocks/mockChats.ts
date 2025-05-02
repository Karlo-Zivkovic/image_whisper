import { Chat } from "@/lib/supabase/entity.types";
import { ChatStatus } from "@/lib/hooks/useChatFilters";

// Helper function to create dates in the past
function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Create mock chats with different statuses and timestamps
export const mockChats: Chat[] = [
  // Pending chats
  {
    id: 1,
    user_id: 101,
    status: "pending" as ChatStatus,
    created_at: getPastDate(2),
    updated_at: getPastDate(2),
  },
  {
    id: 2,
    user_id: 102,
    status: "pending" as ChatStatus,
    created_at: getPastDate(1),
    updated_at: getPastDate(1),
  },
  {
    id: 3,
    user_id: 103,
    status: "pending" as ChatStatus,
    created_at: getPastDate(0.5),
    updated_at: getPastDate(0.5),
  },

  // In progress chats
  {
    id: 4,
    user_id: 104,
    status: "in_progress" as ChatStatus,
    created_at: getPastDate(3),
    updated_at: getPastDate(1),
  },
  {
    id: 5,
    user_id: 105,
    status: "in_progress" as ChatStatus,
    created_at: getPastDate(2),
    updated_at: getPastDate(0.75),
  },

  // Completed chats
  {
    id: 6,
    user_id: 106,
    status: "completed" as ChatStatus,
    created_at: getPastDate(5),
    updated_at: getPastDate(3),
  },
  {
    id: 7,
    user_id: 107,
    status: "completed" as ChatStatus,
    created_at: getPastDate(4),
    updated_at: getPastDate(2),
  },
  {
    id: 8,
    user_id: 101, // Same user as chat #1 (for search testing)
    status: "completed" as ChatStatus,
    created_at: getPastDate(7),
    updated_at: getPastDate(5),
  },
  {
    id: 9,
    user_id: 102, // Same user as chat #2 (for search testing)
    status: "completed" as ChatStatus,
    created_at: getPastDate(10),
    updated_at: getPastDate(8),
  },
  {
    id: 10,
    user_id: 110,
    status: "completed" as ChatStatus,
    created_at: getPastDate(15),
    updated_at: getPastDate(12),
  },
];
