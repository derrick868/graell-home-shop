import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 👈 if you’re using React Router

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch unread messages + orders
  useEffect(() => {
    fetchInitial();

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
    const { data: messages } = await supabase
      .from("contact_messages")
      .select("id, full_name, created_at")
      .eq("seen", false)
      .order("created_at", { ascending: false })
      .limit(5);

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

  const deleteNotification = async (id: string, type: string) => {
    if (type === "message") {
      await supabase.from("contact_messages").update({ seen: true }).eq("id", id.replace("msg-", ""));
    } else if (type === "order") {
      await supabase.from("orders").update({ seen: true }).eq("id", id.replace("order-", ""));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    await supabase.from("contact_messages").update({ seen: true }).eq("seen", false);
    await supabase.from("orders").update({ seen: true }).eq("seen", false);
    setNotifications([]);
  };

  return (
    <div className="relative p-6">
      {/* Bell Icon with Badge */}
      <button className="relative" onClick={() => setOpen((prev) => !prev)}>
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
          <h2 className="text-lg font-bold mb-2">Notifications</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex justify-between items-center bg-gray-50 shadow p-2 rounded-lg cursor-pointer"
                  onClick={() => {
                    if (n.type === "order") {
                      const orderId = n.id.replace("order-", "");
                      navigate(`/admin/orders/${orderId}`); // 👈 Go to single order page
                    }
                  }}
                >
                  <span>{n.message}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent navigation
                      deleteNotification(n.id, n.type);
                    }}
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
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
