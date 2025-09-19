import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  order_items: OrderItem[];
}

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          shipping_address,
          created_at,
          order_items (
            id,
            quantity,
            price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-primary">Order History</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-4">
          <h1 className="text-2xl font-bold text-primary">No Orders Yet</h1>
          <p className="text-muted-foreground">You haven't placed any orders yet</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Start Shopping
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">Order History</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × KES {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        KES {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      KES {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Shipping to:</strong> {order.shipping_address}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrderHistoryPage;