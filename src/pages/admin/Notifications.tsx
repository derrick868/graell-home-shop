import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Get new orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Get new contacts (messages)
      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (ordersError) console.error("Error fetching orders:", ordersError);
      if (contactsError) console.error("Error fetching contacts:", contactsError);

      // Merge both sources into one notification list
      const merged = [
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

      // Sort by most recent
      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setNotifications(merged);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center cursor-pointer">
        <Bell className="h-6 w-6 text-gray-600" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
            {notifications.length}
          </Badge>
        )}
      </div>

      {notifications.length > 0 && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg z-50">
          <CardContent className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={`${n.type}-${n.id}`} className="text-sm border-b pb-1 last:border-0">
                <span className="font-semibold">{n.type.toUpperCase()}</span>: {n.message}
                <div className="text-xs text-gray-500">
                  {new Date(n.date).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
