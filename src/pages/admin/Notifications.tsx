import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Notification = {
  type: "order" | "contact";
  id: string | number;
  date: string;
  message: string;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Add new notification
  const addNotification = (newNotif: Notification) => {
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      return updated.slice(0, 10); // keep max 10
    });
  };

  // Delete single
  const deleteNotification = (id: string | number, type: string) => {
    setNotifications((prev) => prev.filter((n) => !(n.id === id && n.type === type)));
  };

  // Clear all
  const clearAll = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const fetchInitial = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const merged: Notification[] = [
        ...(orders || []).map((o) => ({
          type: "order",
          id: o.id,
          date: o.created_at,
          message: `New order received (#${o.id})`,
        })),
        ...(contacts || []).map((c) => ({
          type: "contact",
          id: c.id,
          date: c.created_at,
          message: `New message from ${c.name}`,
        })),
      ];

      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(merged);
    };

    fetchInitial();

    // Subscribe to new orders
    const ordersSub = supabase
      .channel("orders-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        addNotification({
          type: "order",
          id: payload.new.id,
          date: payload.new.created_at,
          message: `New order received (#${payload.new.id})`,
        });
      })
      .subscribe();

    // Subscribe to new contacts
    const contactsSub = supabase
      .channel("contacts-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" }, (payload) => {
        addNotification({
          type: "contact",
          id: payload.new.id,
          date: payload.new.created_at,
          message: `New message from ${payload.new.name}`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(contactsSub);
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell icon with badge */}
      <div className="flex items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <Bell className="h-6 w-6 text-gray-600" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
            {notifications.length}
          </Badge>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg z-50">
          <CardHeader className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500 hover:text-red-600"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 && <p className="text-sm text-gray-500">No notifications</p>}
            {notifications.map((n) => (
              <div
                key={`${n.type}-${n.id}`}
                className="flex justify-between items-start text-sm border-b pb-1 last:border-0"
              >
                <div>
                  <span className="font-semibold">{n.type.toUpperCase()}</span>: {n.message}
                  <div className="text-xs text-gray-500">
                    {new Date(n.date).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-gray-400 hover:text-red-500"
                  onClick={() => deleteNotification(n.id, n.type)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
