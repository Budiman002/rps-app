import { Bell, Check, Clock } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRpsApi } from "@/functions/api/rpsApi";
import { Notification } from "@/types/domain";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NotificationPopoverProps {
  onUnreadCountChange: (count: number) => void;
}

export function NotificationPopover({ onUnreadCountChange }: NotificationPopoverProps) {
  const { getNotifications, markNotificationAsRead } = useRpsApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isLoadingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const response = await getNotifications();
      
      // Access the .data property from FetchResult
      const notificationsArray = Array.isArray(response.data) ? response.data : [];
      
      const sorted = [...notificationsArray].sort((a, b) => 
        new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
      setNotifications(sorted);
      const unreadCount = sorted.filter(n => !n.IsRead).length;
      onUnreadCountChange(unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [getNotifications, onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.Id === id ? { ...n, IsRead: true } : n)
      );
      const newUnreadCount = notifications.filter(n => n.Id !== id ? !n.IsRead : false).length;
      onUnreadCountChange(newUnreadCount);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.IsRead);
    for (const n of unread) {
      await handleMarkAsRead(n.Id);
    }
  };

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 transition-colors group-hover:text-blue-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-xl border-gray-200 bg-white" align="end">
        <div className="flex flex-col max-h-[450px]">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.Id} 
                    className={`p-4 transition-colors relative group ${
                      !notification.IsRead ? "bg-blue-50/30" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-opacity ${
                        !notification.IsRead ? "bg-blue-500" : "opacity-0"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-none ${!notification.IsRead ? "font-semibold" : "text-gray-600"}`}>
                            {notification.Title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.CreatedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-normal">
                          {notification.Message}
                        </p>
                        {!notification.IsRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] items-center gap-1 text-gray-400 hover:text-blue-600 hover:bg-white border transparent hover:border-blue-100 mt-2 rounded-md"
                            onClick={() => handleMarkAsRead(notification.Id)}
                          >
                            <Check className="h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {notifications.length > 5 && (
            <div className="p-2 border-t text-center bg-gray-50/30">
              <Button variant="ghost" className="w-full h-8 text-xs text-gray-500 hover:text-gray-700">
                View all history
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
