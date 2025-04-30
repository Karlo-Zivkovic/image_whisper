import { User } from "lucide-react";

export default function ChatHeader({
  chatId,
  clientId,
}: {
  chatId: number;
  clientId: number | null;
}) {
  return (
    <div className="border-b px-4 py-3 bg-white flex items-center justify-between">
      <div className="flex items-center">
        {/* <div className="hidden sm:flex mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </div> */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          <User className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium">
            Client {clientId} - Chat {chatId}
          </div>
          <div className="text-xs text-gray-500">Client Images & Queries</div>
        </div>
      </div>
      {/* <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Upload className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <StatusMenu />
        </Button>
      </div> */}
    </div>
  );
}
