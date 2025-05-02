import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatStatus } from "@/lib/hooks/useChatFilters";

interface ChatFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: ChatStatus;
  onStatusChange: (status: ChatStatus) => void;
}

export function ChatFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ChatFiltersProps) {
  return (
    <div className="space-y-2">
      {/* Search by User ID */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by User ID"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as ChatStatus)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
