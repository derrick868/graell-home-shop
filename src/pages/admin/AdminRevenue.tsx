import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminRevenue = () => {
  const [deliveredRevenue, setDeliveredRevenue] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("total_amount, status");

        if (error) throw error;

        const deliveredOrders = (data || []).filter(
          (order) => order.status === "delivered"
        );

        const total = deliveredOrders.reduce(
          (sum, order) => sum + Number(order.total_amount),
          0
        );

        setDeliveredRevenue(total);
        setDeliveredCount(deliveredOrders.length);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Delivered Orders:</span>{" "}
            {deliveredCount}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Delivered Revenue:</span> KES:
            {deliveredRevenue.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRevenue;
