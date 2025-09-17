import { Link, useLocation } from "react-router-dom";
import { Home, Grid3X3, ShoppingCart, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const BottomNav = () => {
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/products", icon: Grid3X3, label: "Products" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: cartItemCount },
    { path: "/orders", icon: Clock, label: "Orders" },
    { path: "/contact", icon: MessageCircle, label: "Contact" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors relative",
                isActive 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {badge && badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <span className={cn(isActive && "text-primary")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;