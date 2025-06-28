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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

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

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export default function OrdersPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login?callbackUrl=/dashboard/orders");
    },
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: pagination.currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (selectedStatus !== "all") {
          params.append("status", selectedStatus);
        }

        const response = await fetch(`/api/orders?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0,
        });
      } catch (error) {
        console.error(error);
        setError("Failed to load orders. Please try again.");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [pagination.currentPage, searchTerm, selectedStatus, status]);

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

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="h-10 w-80 bg-muted animate-pulse rounded" />
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/50 p-4 font-medium">
              <div className="col-span-3">Order ID</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Actions</div>
            </div>

            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 items-center p-4 border-t">
                <div className="col-span-3">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="col-span-3">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="col-span-2">
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          />
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "When you place an order, it will appear here"}
              </p>
              {(searchTerm || selectedStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-muted/50 p-4 font-medium">
                <div className="col-span-3">Order ID</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Actions</div>
              </div>

              {orders.map((order) => (
                <div
                  key={order._id}
                  className="grid grid-cols-12 items-center p-4 border-t hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                >
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}