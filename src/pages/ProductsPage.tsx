import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

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
}

// ✅ CategoryFilter defined outside
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange("all")}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedCategory === "all"
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        All
      </button>

      {categories.map((cat) => {
        const slug = cat.name.toLowerCase().replace(/\s+/g, "-");
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(slug)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === slug
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

const ProductsPage = () => {
  const { category: categoryParam } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
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
        .order("name");

      if (selectedCategory !== "all") {
        const category = categories.find(
          (cat) =>
            cat.name.toLowerCase().replace(/\s+/g, "-") ===
            selectedCategory.toLowerCase()
        );
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts();
    }
  }, [selectedCategory, categories]);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Our Products</h1>
          <p className="text-muted-foreground">
            Discover our beautiful collection of home and kitchen essentials
          </p>
        </div>

        {/* ✅ Use CategoryFilter here */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
