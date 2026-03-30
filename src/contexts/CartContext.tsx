import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);
export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // --- Guest ID generator ---
  const getGuestId = () => {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guest_id", guestId);
    }
    return guestId;
  };

  const getIdentifier = () => {
    return user ? { user_id: user.id } : { guest_id: getGuestId() };
  };

  // --- Fetch cart items ---
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    setLoading(true);
    const identifier = getIdentifier();

    try {
      const { data, error } = await supabase
        .from("shopping_cart")
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url,
            stock_quantity
          )
        `)
        .match(identifier);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast({ title: "Error", description: "Failed to fetch cart items", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- Add to cart ---
  const addToCart = async (productId: string, quantity = 1) => {
    const identifier = getIdentifier();

    try {
      const { error } = await supabase
        .from("shopping_cart")
        .upsert(
          {
            ...identifier,
            product_id: productId,
            quantity,
          },
          {
            // Must match a UNIQUE constraint in Supabase
            onConflict: "product_id,user_id,guest_id",
          }
        );

      if (error) throw error;
      await fetchCartItems();

      toast({ title: "Added to Cart", description: "Item added successfully" });
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    }
  };

  // --- Update quantity ---
  const updateQuantity = async (productId: string, quantity: number) => {
    const identifier = getIdentifier();
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const { error } = await supabase
        .from("shopping_cart")
        .update({ quantity })
        .match({ ...identifier, product_id: productId });

      if (error) throw error;
      await fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast({ title: "Error", description: "Failed to update quantity", variant: "destructive" });
    }
  };

  // --- Remove item ---
  const removeFromCart = async (productId: string) => {
    const identifier = getIdentifier();

    try {
      const { error } = await supabase
        .from("shopping_cart")
        .delete()
        .match({ ...identifier, product_id: productId });

      if (error) throw error;
      await fetchCartItems();

      toast({ title: "Removed", description: "Item removed from cart" });
    } catch (err) {
      console.error("Error removing item:", err);
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    }
  };

  // --- Clear cart ---
  const clearCart = async () => {
    const identifier = getIdentifier();

    try {
      const { error } = await supabase
        .from("shopping_cart")
        .delete()
        .match(identifier);

      if (error) throw error;
      setItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast({ title: "Error", description: "Failed to clear cart", variant: "destructive" });
    }
  };

  // --- Cart totals ---
  const getCartTotal = () =>
    items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const getCartItemCount = () =>
    items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
