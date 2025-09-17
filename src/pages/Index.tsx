import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

interface Category {
  id: string;
  name: string;
  image_url: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          stock_quantity,
          category:categories (
            id,
            name
          )
        `)
        .eq("is_active", true)
        .limit(6);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .limit(5);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Welcome to Graell Interiors
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover beautiful home and kitchen essentials that bring style and functionality to your space
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/products">Shop Now</Link>
          </Button>
        </section>

        {/* Categories */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-center font-medium text-primary group-hover:text-primary/80">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Featured Products</h2>
            <Button asChild variant="outline">
              <Link to="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
