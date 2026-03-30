import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Only for showing Profile/Admin when logged in

const Header = () => {
  const { getCartItemCount } = useCart();
  const { user } = useAuth(); // Only for showing user/admin buttons
  const navigate = useNavigate();
  const cartItemCount = getCartItemCount();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if logged-in user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!error) setIsAdmin(data?.role === "admin");
      } catch (err) {
        console.error("Error checking admin role:", err);
      }
    };

    checkAdminRole();
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          to="/" 
          className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Graell Interiors
        </Link>

        <div className="flex items-center gap-3">
          {/* Cart button is always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>

          {/* Show Profile/Admin only if logged in */}
          {user ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
            </>
          ) : (
            // Guest sees "Sign In" button
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
