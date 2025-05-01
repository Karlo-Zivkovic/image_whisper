"use client";

import { CheckCheck, Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  error: "bg-red-100 text-red-800 border-red-200",
};

interface MessageStatusProps {
  status: string;
  showCompleted?: boolean; // Only for response section
}

export default function MessageStatus({
  status,
  showCompleted = false,
}: MessageStatusProps) {
  return (
    <div className="flex items-center gap-1">
      {status === "completed" ? (
        <CheckCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
      ) : (
        <Clock className="h-3.5 w-3.5 mr-1" />
      )}

      {/* Status Tag */}
      <span
        className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}
      >
        {showCompleted && status === "completed"
          ? "Completed"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}

export { STATUS_STYLES };
