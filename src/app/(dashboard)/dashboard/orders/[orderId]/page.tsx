"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface OrderItem {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface TrackingInfo {
  status: string;
  history: Array<{
    status: string;
    timestamp: Date;
    description: string;
  }>;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "card" | "cash";
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  trackingInfo: TrackingInfo;
}

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setOrder(data.order);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to fetch order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/orders")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/orders")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="h-8 w-8 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {error || "Order not found"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error
                ? "There was an error loading the order details. Please try again later."
                : "The order you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/orders")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Button>

      <div className="grid gap-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Order #{order.orderId}</CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                </Badge>
                <Badge className={getPaymentStatusColor(order.paymentStatus)} variant="secondary">
                  Payment: {(order.paymentStatus || 'pending').charAt(0).toUpperCase() + (order.paymentStatus || 'pending').slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Order Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {order.trackingInfo?.history?.map((event, index) => (
                <div key={index} className="flex items-start mb-4 last:mb-0">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    getStatusColor(event.status as Order["status"])
                  }`}>
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">
                      {(event.status || '').charAt(0).toUpperCase() + (event.status || '').slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.timestamp), "PPP p")}
                    </p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
              {(!order.trackingInfo?.history || order.trackingInfo.history.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No tracking information available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item._id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-20 rounded-lg border bg-muted">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name || 'Product image'}
                          fill
                          className="object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name || 'Unnamed Product'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity || 0}
                      </p>
                      <p className="text-sm font-medium">
                        ${((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    No items in this order
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {order.shippingInfo?.firstName || ''} {order.shippingInfo?.lastName || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.shippingInfo?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.shippingInfo?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {[
                        order.shippingInfo?.address,
                        order.shippingInfo?.city,
                        order.shippingInfo?.state,
                        order.shippingInfo?.zipCode,
                        order.shippingInfo?.country,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(order.totals?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${(order.totals?.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(order.totals?.tax || 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(order.totals?.total || 0).toFixed(2)}</span>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                  <p className="font-medium">
                    {order.paymentMethod === "card" ? "Credit Card" : "Cash on Delivery"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {order.status && order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="mt-4 space-y-2">
                {order.status === "pending" && (
                  <Button variant="destructive" className="w-full">
                    Cancel Order
                  </Button>
                )}
                {order.status === "shipped" && (
                  <Button className="w-full">
                    Track Shipment
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 