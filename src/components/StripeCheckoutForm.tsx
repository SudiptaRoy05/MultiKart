"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

interface StripeCheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

export function StripeCheckoutForm({ onSuccess }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/orders`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else {
        toast.success("Payment successful");
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
} 