import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Trash } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch unread messages + orders
  useEffect(() => {
    fetchInitial();

    // Subscribe to realtime
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          setNotifications((prev) => [
            {
              id: `msg-${payload.new.id}`,
              type: "message",
              message: `New message from ${payload.new.full_name}`,
            },
            ...prev,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setNotifications((prev) => [
            {
              id: `order-${payload.new.id}`,
              type: "order",
              message: `New order #${payload.new.id}`,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchInitial = async () => {
    // Fetch unread messages
    const { data: messages } = await supabase
      .from("contact_messages")
      .select("id, full_name, created_at")
      .eq("seen", false)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch unread orders
    const { data: orders } = await supabase
      .from("orders")
      .select("id, created_at")
      .eq("seen", false)
      .order("created_at", { ascending: false })
      .limit(5);

    const formatted = [
      ...(messages?.map((m) => ({
        id: `msg-${m.id}`,
        type: "message",
        message: `New message from ${m.full_name}`,
      })) || []),
      ...(orders?.map((o) => ({
        id: `order-${o.id}`,
        type: "order",
        message: `New order #${o.id}`,
      })) || []),
    ];

    setNotifications(formatted);
  };

  // Delete one notification
  const deleteNotification = async (id: string, type: string) => {
    if (type === "message") {
      await supabase
        .from("contact_messages")
        .update({ seen: true })
        .eq("id", id.replace("msg-", ""));
    } else if (type === "order") {
      await supabase
        .from("orders")
        .update({ seen: true })
        .eq("id", id.replace("order-", ""));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const clearAll = async () => {
    await supabase.from("contact_messages").update({ seen: true }).eq("seen", false);
    await supabase.from("orders").update({ seen: true }).eq("seen", false);
    setNotifications([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Bell className="w-5 h-5" /> Notifications
      </h2>

      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="flex justify-between items-center bg-white shadow p-3 rounded-lg"
            >
              <span>{n.message}</span>
              <button
                onClick={() => deleteNotification(n.id, n.type)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <button
          onClick={clearAll}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default Notifications;
