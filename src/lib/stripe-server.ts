import StripeSDK from "stripe";

// Server-side: Stripe SDK
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY");
}

export const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  typescript: true,
}); 