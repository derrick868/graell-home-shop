// src/pages/admin/SingleOrder.tsx
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
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          total_amount,
          status,
          customer_name,
          customer_email,
          order_items (
            id,
            product_name,
            quantity,
            price
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching order:", error);
      } else {
        setOrder(data);
      }
      setLoading(false);
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

      <h1 className="text-2xl font-bold mt-4 mb-2">
        Order #{order.id}
      </h1>
      <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleString()}</p>

      <div className="mt-4 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
        <p>
          <strong>Name:</strong> {order.customer_name}
        </p>
        <p>
          <strong>Email:</strong> {order.customer_email}
        </p>
      </div>

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
                  <td className="p-2 border">{item.product_name}</td>
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
