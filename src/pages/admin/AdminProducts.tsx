import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
  category_id: string;
  categories: { name: string };
}

interface Category {
  id: string;
  name: string;
}

// ✅ Admin-only upload helper
async function uploadProductImage(file: File) {
  // 1. Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("You must be logged in to upload images.");

  // 2. Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile || profile.role !== "admin") {
    throw new Error("Only admins can upload product images.");
  }

  // 3. Prepare file path
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  // 4. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  // 5. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  return { publicUrl, path: filePath };
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    category_id: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      image_url: "",
      category_id: "",
      is_active: true,
    });
    setFile(null);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id,
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if user is authenticated and admin
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to add products.");

      console.log("Current user:", user.id);

      // Check admin status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error("Failed to check user permissions.");
      }
      
      if (!profile || profile.role !== "admin") {
        throw new Error("Only admins can manage products.");
      }

      console.log("User is admin, proceeding with product save");

      let imageUrl = formData.image_url;

      if (file) {
        const { publicUrl } = await uploadProductImage(file);
        imageUrl = publicUrl;
        console.log("File uploaded! Public URL:", imageUrl);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: imageUrl,
        category_id: formData.category_id,
        is_active: formData.is_active,
      };

      console.log("Product data to save:", productData);

      if (editingProduct) {
        console.log("Updating product:", editingProduct.id);
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
          .select();

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        console.log("Update result:", data);
        
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        console.log("Inserting new product");
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        console.log("Insert result:", data);
        
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

   return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Products Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              {/* ✅ form goes here */}
              {/* … (your form code unchanged) */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your store products</CardDescription>
          </CardHeader>

          <CardContent>
            {/* ✅ Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              {/* … table code */}
            </div>

            {/* ✅ Mobile Cards */}
            <div className="md:hidden space-y-4">
              {/* … mobile cards code */}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};


export default AdminProducts;
