import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "order" | "contact";
  message: string;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for new orders
    const ordersChannel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as any;
          const note: Notification = {
            id: order.id,
            type: "order",
            message: `New order #${order.id} - $${order.total_amount}`,
            created_at: order.created_at,
          };

          setNotifications((prev) => [note, ...prev]);
          toast({
            title: "New Order",
            description: `Order #${order.id} was placed.`,
          });
        }
      )
      .subscribe();

    // Listen for new contacts/messages
    const contactsChannel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacts" },
        (payload) => {
          const contact = payload.new as any;
          const note: Notification = {
            id: contact.id,
            type: "contact",
            message: `New message from ${contact.name}`,
            created_at: contact.created_at,
          };

          setNotifications((prev) => [note, ...prev]);
          toast({
            title: "New Contact Message",
            description: `Message from ${contact.name}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [toast]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
              {notifications.length}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <DropdownMenuItem>No notifications</DropdownMenuItem>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="text-sm">
              {n.message}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
