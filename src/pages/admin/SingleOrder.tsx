import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const SingleOrder = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchOrder = async () => {
    setLoading(true);

    try {
      // 1. Fetch the order + items
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          name,
          phone,
          status,
          profile_id,
          order_items!order_id (
            id,
            quantity,
            price,
            products ( name )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        setLoading(false);
        return;
      }

      let profileData = null;

      // 2. If profile_id exists, fetch profile separately
      if (orderData?.profile_id) {
        const { data: prof, error: profError } = await supabase
          .from("profiles")
          .select("first_name, email, phone")
          .eq("id", orderData.profile_id)
          .maybeSingle();

        if (!profError) {
          profileData = prof;
        }
      }

      setOrder({ ...orderData, profile: profileData });
    } catch (err) {
      console.error("Unexpected error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchOrder();
}, [id]);


  if (loading) {
    return <p className="p-6">Loading order details...</p>;
  }

  if (!order) {
    return <p className="p-6 text-red-500">Order not found.</p>;
  }

  return (
    <div className="p-6">
      <Link
        to="/admin/orders"
        className="flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Order #{order.id}</h1>
      <p className="text-gray-600">
        Placed on {new Date(order.created_at).toLocaleString()}
      </p>

      {/* Customer details */}
      <div className="mt-4 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
        <p>
          <strong>Name:</strong>{" "}
          {order.profiles?.first_name || order.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {order.profiles?.email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          {order.profiles?.phone || order.phone || "N/A"}
        </p>
      </div>

      {/* Order items */}
      <div className="mt-4 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Order Items</h2>
        {order.order_items && order.order_items.length > 0 ? (
          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-2 border">
                    {item.products?.name || "Unknown"}
                  </td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">KES {item.price}</td>
                  <td className="p-2 border">
                    KES {item.quantity * item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items in this order</p>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total Amount:</strong> KES {order.total_amount}
        </p>
      </div>
    </div>
  );
};

export default SingleOrder;
