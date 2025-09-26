import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    city: "",
    country: "Kenya",
  });

  // ✅ Guard routes
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }
  }, [user, items, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!user || items.length === 0) return;

    if (!shippingInfo.city) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const totalAmount = getCartTotal();

      // ✅ Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, phone")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Profile Missing",
          description: "Please update your profile before placing an order.",
          variant: "destructive",
        });
        navigate("/profile");
        setLoading(false);
        return;
      }

      // ✅ Require name + phone
      if (!profile.first_name || !profile.phone) {
        toast({
          title: "Profile Incomplete",
          description:
            "Please update your profile with your name and phone number before placing an order.",
          variant: "destructive",
        });
        navigate("/profile");
        setLoading(false);
        return;
      }

      const shippingAddress = `${shippingInfo.city}, ${shippingInfo.country}`;

      // ✅ Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // ✅ Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // ✅ Clear cart
      await clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed.`,
      });

      navigate("/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-primary">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Kenya"
                  value={shippingInfo.country}
                  onChange={(e) =>
                    handleInputChange("country", e.target.value)
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>KES {item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>KES {getCartTotal()}</span>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
