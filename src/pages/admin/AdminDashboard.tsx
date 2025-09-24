import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Users, TrendingUp, Home, Mail } from "lucide-react";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminCategories from "./AdminCategories";
import AdminUsers from "./AdminUsers";
import AdminContacts from "./AdminContacts";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalContacts: 0,
  });

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        setIsAdmin(profile?.role === "admin");
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };
    checkAdminRole();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      try {
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        const { data: orders } = await supabase.from("orders").select("total_amount");

        const { count: customersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: contactsCount } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true });

        const totalRevenue =
          orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders?.length || 0,
          totalCustomers: customersCount || 0,
          totalRevenue,
          totalContacts: contactsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, [isAdmin]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store from here</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card onClick={() => setActiveTab("products")} className="cursor-pointer hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>

            <Card onClick={() => setActiveTab("orders")} className="cursor-pointer hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card onClick={() => setActiveTab("users")} className="cursor-pointer hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card onClick={() => setActiveTab("revenue")} className="cursor-pointer hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES:{stats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card onClick={() => setActiveTab("contacts")} className="cursor-pointer hover:shadow-lg transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContacts}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tab buttons */}
          <TabsList className="flex w-full justify-between gap-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Tab contents */}
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="categories"><AdminCategories /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="contacts"><AdminContacts /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
