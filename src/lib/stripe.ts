import { loadStripe } from "@stripe/stripe-js";
import StripeSDK from "stripe";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// For server-side Stripe operations
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil", // Latest supported API version
  typescript: true,
});
