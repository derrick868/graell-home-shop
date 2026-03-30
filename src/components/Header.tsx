import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const cartItemCount = getCartItemCount();
  const [isAdmin, setIsAdmin] = useState(false);

  // Optional: keep admin logic if you want, but skip user checks for guests
  useEffect(() => {
    const checkAdminRole = async () => {
      // Remove 'if (!user) return;' for guest access
      // Only check admin if you have a logged-in user
    };

    checkAdminRole();
  }, []);

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
          {/* Always show cart button */}
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

          {/* Admin / Profile buttons removed for guest-friendly view */}
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
