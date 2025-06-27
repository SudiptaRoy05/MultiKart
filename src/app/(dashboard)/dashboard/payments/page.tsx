"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PaymentDetails = {
  name: string;
  email: string;
  orderId: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Failed";
  date: Date;
};

export default function PaymentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get product details from URL params
  const productId = searchParams.get("productId");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  const payment: PaymentDetails = {
    name: "Sudipta Roy",
    email: "sudipta@example.com",
    orderId: orderId || "ORD-89384",
    amount: amount ? parseFloat(amount) : 4599.99,
    method: "Credit Card (Visa)",
    status: "Pending",
    date: new Date(),
  };

  const handlePaymentSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!productId || !amount || !orderId) {
        throw new Error("Missing required payment details");
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          amount: parseFloat(amount),
          paymentMethod: payment.method,
          status: "Paid",
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Update payment status locally
      payment.status = "Paid";
      
      // Redirect to orders page after successful payment
      router.push("/dashboard/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{payment.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{payment.email}</span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span>{payment.orderId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span>${payment.amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method:</span>
            <span>{payment.method}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant={
                payment.status === "Paid"
                  ? "default"
                  : payment.status === "Pending"
                  ? "outline"
                  : "destructive"
              }
            >
              {payment.status}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{format(payment.date, "PPP p")}</span>
          </div>

          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}

          <Button
            className="w-full mt-6"
            onClick={handlePaymentSubmit}
            disabled={isSubmitting || payment.status === "Paid"}
          >
            {isSubmitting ? "Processing..." : payment.status === "Paid" ? "Payment Completed" : "Confirm Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
