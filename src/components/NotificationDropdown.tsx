import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Package, ShoppingCart, Wallet, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, Notification } from "@/hooks/useNotifications";

const typeIcons: Record<string, typeof Bell> = {
  order: ShoppingCart,
  batch: Package,
  wallet: Wallet,
  info: Info,
};

const typeColors: Record<string, string> = {
  order: "bg-accent text-accent-foreground",
  batch: "bg-primary/10 text-primary",
  wallet: "bg-primary/10 text-primary",
  info: "bg-muted text-muted-foreground",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const unreadCount = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-display font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1 text-primary"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No notifications yet</div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.slice(0, 20).map((n: Notification) => {
                const Icon = typeIcons[n.type] || Bell;
                const color = typeColors[n.type] || typeColors.info;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead.mutate(n.id);
                      if (n.reference_id) {
                        if (n.type === "product" || n.type === "batch") {
                          navigate(`/batch/${n.reference_id}`);
                        } else if (n.type === "order") {
                          navigate(`/sales-partner/orders`);
                        } else if (n.type === "wallet") {
                          navigate(`/wallet`);
                        } else if (n.type === "inventory") {
                          navigate(`/batch/${n.reference_id}`);
                        }
                      }
                      setOpen(false);
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium line-clamp-1 ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
