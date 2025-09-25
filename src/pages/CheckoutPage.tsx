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
    phone: "",
    city: "",
    country: "Kenya",
  });

  // ✅ Fetch profile phone when component mounts
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    const fetchProfilePhone = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile phone:", error);
        return;
      }

      if (profile?.phone) {
        setShippingInfo((prev) => ({ ...prev, phone: profile.phone }));
      } else {
        toast({
          title: "No phone number found",
          description:
            "Please provide your phone number for this order. You can save it in your profile later for faster checkouts.",
        });
      }
    };

    fetchProfilePhone();
  }, [user, items, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!user || items.length === 0) return;

    if (!shippingInfo.phone || !shippingInfo.city) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required details",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = `${shippingInfo.city}, ${shippingInfo.country} - Phone: ${shippingInfo.phone}`;
      const totalAmount = getCartTotal();

      // ✅ Save chosen phone into orders
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          phone: shippingInfo.phone, // 👈 store per-order phone
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value)
                  }
                  required
                />
              </div>

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
          {/* ... existing code unchanged ... */}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
