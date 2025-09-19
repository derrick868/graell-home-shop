import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  category: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    await addToCart(product.id, 1);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            {product.category.name}
          </Badge>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-primary hover:text-primary/80 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold text-accent">
              KES {product.price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.stock_quantity > 0 ? (
                product.stock_quantity <= 5 ? (
                  <span className="text-destructive">Only {product.stock_quantity} left</span>
                ) : (
                  `${product.stock_quantity} in stock`
                )
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </p>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            size="sm"
            className="min-w-[80px]"
          >
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;