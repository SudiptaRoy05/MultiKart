"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type Order = {
  _id: string;
  orderId: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }>;
  totals: {
    total: number;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        toast.error("Failed to load orders");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "shipped":
        return "bg-purple-500/10 text-purple-500";
      case "delivered":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getActionButton = (status: Order["status"], orderId: string) => {
    switch (status) {
      case "delivered":
        return (
          <Button variant="outline" size="sm">
            Buy Again
          </Button>
        );
      case "shipped":
        return (
          <Button variant="outline" size="sm">
            Track
          </Button>
        );
      case "processing":
        return (
          <Button variant="outline" size="sm" className="text-destructive">
            Cancel
          </Button>
        );
      case "cancelled":
        return (
          <Button variant="outline" size="sm">
            Reorder
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order?.orderId) return false;
    return order.orderId.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">View and manage your order history.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            placeholder="Search by order id"
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Order Status</span>
            {/* Status filter dropdown could be added here */}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try a different search term" : "When you place an order, it will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/50 p-4 font-medium">
              <div className="col-span-3">Order ID</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Actions</div>
            </div>

            {filteredOrders.map((order) => (
              <div key={order._id} className="grid grid-cols-12 items-center p-4 border-t hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order._id}`)}>
                <div className="col-span-3 font-medium">{order.orderId}</div>
                <div className="col-span-3 text-muted-foreground">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </div>
                <div className="col-span-2">
                  <Badge className={getStatusColor(order.status)} variant="secondary">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="col-span-2 font-medium">
                  ${order.totals.total.toFixed(2)}
                </div>
                <div className="col-span-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/orders/${order._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}