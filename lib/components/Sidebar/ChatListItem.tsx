import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ChatStatus } from "@/lib/hooks/useChatFilters";
import { Chat } from "@/lib/supabase/entity.types";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  // Function to get status badge with appropriate color
  const getStatusBadge = (status: ChatStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            In Progress
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 
        ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="font-medium truncate">Chat {chat.id}</p>
            <p className="text-xs text-gray-500">
              {chat.updated_at &&
                formatDistanceToNow(new Date(chat.updated_at), {
                  addSuffix: true,
                })}
            </p>
          </div>
          <div className="flex justify-between items-center mt-1">
            {chat.user_id && (
              <p className="text-xs text-gray-500 truncate">
                User {chat.user_id}
              </p>
            )}
            {chat.status && getStatusBadge(chat.status as ChatStatus)}
          </div>
        </div>
      </div>
    </div>
  );
}
