import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-primary">Shopping Cart</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-4">
          <h1 className="text-2xl font-bold text-primary">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Start shopping to add items to your cart</p>
          <Button onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">Shopping Cart</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-primary">{item.product.name}</h3>
                    <p className="text-accent font-medium">KES {item.product.price.toFixed(2)}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 bg-muted rounded min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      KES {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">KES {getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CartPage;