import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useGetAppStatus } from "@/lib/hooks/api/useGetAppStatus";
import { useUpdateAppStatus } from "@/lib/hooks/api/useUpdateAppStatus";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AppStatusControl() {
  const { data: appStatus, isLoading, error } = useGetAppStatus();
  const updateAppStatus = useUpdateAppStatus();

  // Use a separate state object for editing to avoid re-renders during typing
  const [editValues, setEditValues] = useState({
    is_available: false,
    status_message: "",
  });

  // Popover open/close state
  const [isOpen, setIsOpen] = useState(false);

  // Update edit values when appStatus changes or popover opens
  useEffect(() => {
    if (appStatus && isOpen) {
      setEditValues({
        is_available: appStatus.is_available,
        status_message: appStatus.status_message || "",
      });
    }
  }, [appStatus, isOpen]);

  // Handlers with useCallback to prevent unnecessary re-renders
  const handleStatusToggle = useCallback((checked: boolean) => {
    setEditValues((prev) => ({ ...prev, is_available: checked }));
  }, []);

  const handleMessageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEditValues((prev) => ({ ...prev, status_message: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (appStatus) {
      updateAppStatus.mutate(
        {
          id: appStatus.id,
          is_available: editValues.is_available,
          status_message: editValues.status_message.trim() || null,
        },
        {
          onSuccess: () => setIsOpen(false),
        }
      );
    }
  }, [appStatus, editValues, updateAppStatus]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="px-3 py-2 border-t flex items-center justify-between">
        <span className="text-xs text-gray-500">System Status</span>
        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error state
  if (error || !appStatus) {
    return (
      <div className="px-3 py-2 border-t flex items-center justify-between">
        <span className="text-xs text-gray-500">System Status</span>
        <AlertCircle className="h-3 w-3 text-red-500" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t flex items-center justify-between">
      {/* Status indicator */}
      <div className="flex items-center">
        <div
          className={cn(
            "w-2 h-2 rounded-full mr-2",
            appStatus.is_available ? "bg-green-500" : "bg-red-500"
          )}
        />
        <span className="text-xs text-gray-500 truncate max-w-[220px]">
          {appStatus.status_message ||
            (appStatus.is_available
              ? "System Available"
              : "System Unavailable")}
        </span>
      </div>

      {/* Status edit popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-4"
          side="top"
          onPointerDownOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="space-y-4">
            <h4 className="font-medium text-sm">System Status Settings</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  System Availability
                </label>
                <Switch
                  checked={editValues.is_available}
                  onCheckedChange={handleStatusToggle}
                  disabled={updateAppStatus.isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500">Status Message</label>
                <Input
                  value={editValues.status_message}
                  onChange={handleMessageChange}
                  placeholder="Enter status message"
                  className="h-8 text-sm"
                  disabled={updateAppStatus.isPending}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateAppStatus.isPending}
                type="button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateAppStatus.isPending}
                type="button"
              >
                {updateAppStatus.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
